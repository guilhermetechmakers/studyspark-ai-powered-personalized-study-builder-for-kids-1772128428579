/**
 * Supabase Edge Function: studies-create
 * Creates a new study in the database.
 * POST /functions/v1/studies-create
 * Body: { topic, subject?, contextNotes?, childProfileId?, learningStyle?, age?, generationOptions? }
 * Returns: { studyId }
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
    const topic = (body?.topic ?? '').toString().trim()
    const learningStyle = (body?.learningStyle ?? 'playful').toString()
    const age = Math.min(18, Math.max(4, typeof body?.age === 'number' ? body.age : 8))

    if (!topic) {
      return new Response(
        JSON.stringify({ message: 'topic required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data, error } = await supabase
      .from('studies')
      .insert({
        user_id: user.id,
        child_profile_id: body?.childProfileId ?? null,
        topic,
        subject: body?.subject ?? '',
        context_notes: body?.contextNotes ?? null,
        learning_style: learningStyle,
        age,
        topic_tags: Array.isArray(body?.topicTags) ? body.topicTags : [],
        folders_path: Array.isArray(body?.foldersPath) ? body.foldersPath : [],
        status: 'draft',
        generation_options: body?.generationOptions ?? { depth: 'medium', outputs: ['flashcards', 'quizzes'], curriculumAligned: false },
      })
      .select('id')
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ studyId: data?.id ?? '' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
