/**
 * Supabase Edge Function: activities-attempt
 * Submits an activity attempt (child session token, no parent auth).
 * POST /functions/v1/activities-attempt
 * Body: { sessionToken, activityId, score, timeSpentMs, hintsUsed?, responses? }
 * Returns: { success, updatedProgress }
 * Uses service role to validate token and insert.
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!serviceKey) {
      return new Response(
        JSON.stringify({ message: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const admin = createClient(supabaseUrl, serviceKey)

    const body = await req.json().catch(() => ({}))
    const sessionToken = (body?.sessionToken ?? body?.session_token ?? '').toString()
    const activityId = (body?.activityId ?? body?.activity_id ?? '').toString()
    const score = Math.max(0, typeof body?.score === 'number' ? body.score : 0)
    const timeSpentMs = Math.max(0, typeof body?.timeSpentMs === 'number' ? body.timeSpentMs : 0)
    const hintsUsed = Math.max(0, typeof body?.hintsUsed === 'number' ? body.hintsUsed : 0)
    const responses = body?.responses ?? {}

    if (!sessionToken || !activityId) {
      return new Response(
        JSON.stringify({ message: 'sessionToken and activityId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: session, error: sessionErr } = await admin
      .from('child_sessions')
      .select('id, child_id, study_id, expires_at, is_active')
      .eq('token', sessionToken)
      .single()

    if (sessionErr || !session) {
      return new Response(
        JSON.stringify({ message: 'Invalid or expired session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const expiresAt = new Date((session.expires_at as string) ?? 0)
    if (expiresAt < new Date() || !session.is_active) {
      return new Response(
        JSON.stringify({ message: 'Session expired or inactive' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: activity, error: actErr } = await admin
      .from('study_activities')
      .select('id, study_id')
      .eq('id', activityId)
      .eq('study_id', session.study_id)
      .single()

    if (actErr || !activity) {
      return new Response(
        JSON.stringify({ message: 'Activity not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: attempt, error: attemptErr } = await admin
      .from('attempts')
      .insert({
        session_id: session.id,
        activity_id: activityId,
        score,
        time_spent_ms: timeSpentMs,
        hints_used: hintsUsed,
        responses: typeof responses === 'object' ? responses : {},
        ended_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (attemptErr || !attempt) {
      return new Response(
        JSON.stringify({ message: attemptErr?.message ?? 'Failed to save attempt' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: summary } = await admin
      .from('progress_summary')
      .select('total_score, total_time_ms, attempt_count, last_attempt_at')
      .eq('child_id', session.child_id)
      .eq('activity_id', activityId)
      .single()

    return new Response(
      JSON.stringify({
        success: true,
        attemptId: attempt.id,
        updatedProgress: summary ?? {
          total_score: score,
          total_time_ms: timeSpentMs,
          attempt_count: 1,
          last_attempt_at: new Date().toISOString(),
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
