/**
 * Supabase Edge Function: studies-revise
 * Revises study content based on user prompt.
 * POST /functions/v1/studies-revise
 * Body: { studyId, blockId?, prompt, notes? }
 * Returns: { draft }
 * Requires: OPENAI_API_KEY (optional - falls back to mock)
 */

import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ message: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json().catch(() => ({}))
    const studyId = (body?.studyId ?? '').toString()
    const prompt = (body?.prompt ?? body?.comments ?? body?.revisionPrompt ?? '').toString().trim()
    const blockId = body?.blockId ?? null

    if (!studyId || !prompt) {
      return new Response(
        JSON.stringify({ message: 'studyId and prompt (or comments) required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: study, error: studyErr } = await supabase
      .from('studies')
      .select('id')
      .eq('id', studyId)
      .eq('user_id', user.id)
      .single()

    if (studyErr || !study) {
      return new Response(
        JSON.stringify({ message: 'Study not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: draftRow } = await supabase
      .from('drafts')
      .select('*')
      .eq('study_id', studyId)
      .single()

    const currentPayload = (draftRow?.content_payload as Record<string, unknown>) ?? {}
    const lessons = Array.isArray(currentPayload.lessons) ? currentPayload.lessons : []
    const block = blockId ? lessons.find((b: { id?: string }) => b?.id === blockId) : null
    const contentToRevise = block?.content ?? JSON.stringify(currentPayload)

    const apiKey = Deno.env.get('OPENAI_API_KEY')
    let revisedContent = contentToRevise

    if (apiKey) {
      const openai = new OpenAI({ apiKey })
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You revise educational content based on user feedback. Return only the revised content, no preamble.' },
          { role: 'user', content: `Original:\n${contentToRevise}\n\nRevision request: ${prompt}\n${body?.notes ? `Notes: ${body.notes}` : ''}` },
        ],
        stream: false,
      })
      revisedContent = completion.choices[0]?.message?.content ?? contentToRevise
    } else {
      revisedContent = `[Revised] ${contentToRevise}\n\n(Revision: ${prompt})`
    }

    let updatedPayload = { ...currentPayload }
    if (blockId && block) {
      const updatedLessons = lessons.map((b: { id?: string; content?: string }) =>
        b?.id === blockId ? { ...b, content: revisedContent } : b
      )
      updatedPayload = { ...updatedPayload, lessons: updatedLessons }
    } else {
      updatedPayload = { ...updatedPayload, lessons: [{ id: 'revised-1', type: 'text', content: revisedContent, order: 0 }] }
    }

    const { data: updated, error: updateErr } = await supabase
      .from('drafts')
      .upsert({
        study_id: studyId,
        version: (draftRow?.version ?? 1) + 1,
        content_payload: updatedPayload,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'study_id' })
      .select()
      .single()

    if (updateErr) {
      return new Response(
        JSON.stringify({ message: updateErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        draft: updated
          ? {
              id: updated.id,
              study_id: updated.study_id,
              version: updated.version,
              content_payload: updated.content_payload,
              created_at: updated.created_at,
              updated_at: updated.updated_at,
            }
          : null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
