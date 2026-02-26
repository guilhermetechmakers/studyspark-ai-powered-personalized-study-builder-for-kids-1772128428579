/**
 * Supabase Edge Function: studies-duplicate
 * Duplicates a study with its draft content.
 * POST /functions/v1/studies-duplicate
 * Body: { studyId }
 * Returns: { id: newStudyId }
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
      .select('*')
      .eq('id', studyId)
      .eq('user_id', user.id)
      .single()

    if (studyErr || !study) {
      return new Response(
        JSON.stringify({ message: 'Study not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: draft } = await supabase
      .from('drafts')
      .select('content_payload, version')
      .eq('study_id', studyId)
      .single()

    const newStudy = {
      user_id: user.id,
      topic: (study.topic as string) ?? 'Untitled',
      topic_tags: study.topic_tags ?? [],
      learning_style: study.learning_style ?? 'playful',
      age: study.age ?? 8,
      folders_path: study.folders_path ?? [],
      status: 'draft',
      subject: study.subject ?? '',
      context_notes: study.context_notes ?? null,
      exam_date: study.exam_date ?? null,
      child_profile_id: study.child_profile_id ?? null,
      generation_options: study.generation_options ?? {},
    }

    const { data: insertedStudy, error: insertErr } = await supabase
      .from('studies')
      .insert(newStudy)
      .select('id')
      .single()

    if (insertErr || !insertedStudy) {
      return new Response(
        JSON.stringify({ message: insertErr?.message ?? 'Failed to create study' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const newStudyId = insertedStudy.id as string
    const contentPayload = (draft?.content_payload as Record<string, unknown>) ?? {}

    await supabase.from('drafts').insert({
      study_id: newStudyId,
      version: (draft?.version as number) ?? 1,
      content_payload: contentPayload,
    })

    return new Response(
      JSON.stringify({ id: newStudyId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
