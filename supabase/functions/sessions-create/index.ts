/**
 * Supabase Edge Function: sessions-create
 * Creates a secure child session for study play.
 * POST /functions/v1/sessions-create
 * Body: { childId, studyId }
 * Returns: { sessionToken, sessionId, expiresAt }
 * Requires: Authorization (parent)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateSecureToken(): string {
  const array = new Uint8Array(32)
  globalThis.crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}

/** Parse draft payload into activities for study_activities table */
function draftToActivities(payload: Record<string, unknown>, studyId: string): Array<{ type: string; content: unknown; order: number }> {
  const activities: Array<{ type: string; content: unknown; order: number }> = []
  let order = 0

  const blocks = Array.isArray((payload as { blocks?: unknown[] }).blocks) ? (payload as { blocks: unknown[] }).blocks : []
  const flashcards = Array.isArray(payload.flashcards) ? payload.flashcards : []
  const quizzes = Array.isArray(payload.quizzes) ? payload.quizzes : []
  const lessons = Array.isArray(payload.lessons) ? payload.lessons : []

  if (blocks.length > 0) {
    blocks.forEach((b: unknown, i: number) => {
      const block = b as Record<string, unknown>
      const type = (block?.type as string) ?? 'LESSON'
      const actType = type === 'flashcards' ? 'flashcard' : type === 'quizzes' ? 'quiz' : 'lesson'
      activities.push({ type: actType, content: block?.content ?? {}, order: i })
    })
  }

  if (activities.length === 0) {
    if (lessons.length > 0) {
      activities.push({ type: 'lesson', content: { lessons }, order: order++ })
    }
    if (flashcards.length > 0) {
      activities.push({ type: 'flashcard', content: { cards: flashcards }, order: order++ })
    }
    if (quizzes.length > 0) {
      activities.push({ type: 'quiz', content: { questions: quizzes }, order: order++ })
    }
  }

  if (activities.length === 0) {
    activities.push({ type: 'lesson', content: { lessons: [] }, order: 0 })
  }

  return activities
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
    const childId = (body?.childId ?? body?.child_id ?? '').toString()
    const studyId = (body?.studyId ?? body?.study_id ?? '').toString()

    if (!childId || !studyId) {
      return new Response(
        JSON.stringify({ message: 'childId and studyId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: study, error: studyErr } = await supabase
      .from('studies')
      .select('id, user_id')
      .eq('id', studyId)
      .eq('user_id', user.id)
      .single()

    if (studyErr || !study) {
      return new Response(
        JSON.stringify({ message: 'Study not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: child, error: childErr } = await supabase
      .from('child_profiles')
      .select('id, user_id')
      .eq('id', childId)
      .eq('user_id', user.id)
      .single()

    if (childErr || !child) {
      return new Response(
        JSON.stringify({ message: 'Child profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: draft } = await supabase
      .from('drafts')
      .select('content_payload')
      .eq('study_id', studyId)
      .single()

    const payload = (draft?.content_payload as Record<string, unknown>) ?? {}
    const activitySpecs = draftToActivities(payload, studyId)

    let activityIds: string[] = []
    const { data: existingActivities } = await supabase
      .from('study_activities')
      .select('id')
      .eq('study_id', studyId)
      .order('position_order', { ascending: true })

    if (Array.isArray(existingActivities) && existingActivities.length > 0) {
      activityIds = existingActivities.map((a) => a.id as string).filter(Boolean)
    } else {
      for (const spec of activitySpecs) {
        const { data: inserted } = await supabase
          .from('study_activities')
          .insert({
            study_id: studyId,
            activity_type: spec.type,
            content: spec.content,
            max_score: 10,
            position_order: spec.order,
          })
          .select('id')
          .single()
        if (inserted?.id) activityIds.push(inserted.id as string)
      }
    }

    const token = generateSecureToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const { data: session, error: sessionErr } = await supabase
      .from('child_sessions')
      .insert({
        child_id: childId,
        study_id: studyId,
        token,
        expires_at: expiresAt.toISOString(),
        is_active: true,
      })
      .select('id')
      .single()

    if (sessionErr || !session) {
      return new Response(
        JSON.stringify({ message: sessionErr?.message ?? 'Failed to create session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        sessionToken: token,
        sessionId: session.id,
        expiresAt: expiresAt.toISOString(),
        activityIds,
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
