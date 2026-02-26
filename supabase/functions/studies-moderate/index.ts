/**
 * Supabase Edge Function: studies-moderate
 * Runs content moderation on study materials.
 * POST /functions/v1/studies-moderate
 * Body: { studyId }
 * Returns: { moderation: { status, issues } }
 * Uses OpenAI Moderation API when OPENAI_API_KEY is set.
 */

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

    if (!studyId) {
      return new Response(
        JSON.stringify({ message: 'studyId required' }),
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
      .select('content_payload')
      .eq('study_id', studyId)
      .single()

    const payload = (draftRow?.content_payload as Record<string, unknown>) ?? {}
    const lessons = Array.isArray(payload.lessons) ? payload.lessons : []
    const flashcards = Array.isArray(payload.flashcards) ? payload.flashcards : []
    const quizzes = Array.isArray(payload.quizzes) ? payload.quizzes : []

    const textToCheck: string[] = []
    for (const l of lessons) {
      if (typeof (l as { content?: string })?.content === 'string') textToCheck.push((l as { content: string }).content)
    }
    for (const f of flashcards) {
      const fc = f as { front?: string; back?: string }
      if (fc?.front) textToCheck.push(fc.front)
      if (fc?.back) textToCheck.push(fc.back)
    }
    for (const q of quizzes) {
      const qz = q as { question?: string }
      if (qz?.question) textToCheck.push(qz.question)
    }

    const fullText = textToCheck.join('\n').slice(0, 10000)
    let status: 'pending' | 'approved' | 'flagged' = 'approved'
    const issues: Array<{ type: string; severity: string; message: string }> = []

    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (apiKey && fullText) {
      const res = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ input: fullText }),
      })
      const mod = await res.json()
      const result = mod?.results?.[0]
      if (result?.flagged) {
        status = 'flagged'
        const categories = result?.categories ?? {}
        for (const [cat, flagged] of Object.entries(categories)) {
          if (flagged) {
            issues.push({ type: cat, severity: 'medium', message: `Content flagged: ${cat}` })
          }
        }
      }
    }

    const { data: modRow, error: modErr } = await supabase
      .from('moderations')
      .insert({
        study_id: studyId,
        status,
        issues,
        reviewed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (modErr) {
      return new Response(
        JSON.stringify({
          moderation: { status, issues, id: null, studyId, reviewedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        moderation: {
          id: modRow?.id,
          studyId: modRow?.study_id,
          status: modRow?.status ?? status,
          issues: modRow?.issues ?? issues,
          reviewedAt: modRow?.reviewed_at,
          createdAt: modRow?.created_at,
        },
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
