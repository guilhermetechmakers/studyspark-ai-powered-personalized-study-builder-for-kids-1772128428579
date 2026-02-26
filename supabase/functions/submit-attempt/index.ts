/**
 * Supabase Edge Function: submit-attempt
 * Submits an activity attempt (child session token required).
 * POST /functions/v1/submit-attempt
 * Body: { sessionToken, activityId?, activityType, score, timeSpentMs, hintsUsed?, responses? }
 * Returns: { success, updatedProgress }
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
    const body = await req.json().catch(() => ({}))
    const sessionToken = (body?.sessionToken ?? body?.session_token ?? '').toString().trim()
    const activityId = body?.activityId ?? body?.activity_id ?? null
    const activityType = (body?.activityType ?? body?.activity_type ?? 'quiz').toString()
    const score = Math.max(0, Math.min(100, typeof body?.score === 'number' ? body.score : 0))
    const timeSpentMs = Math.max(0, typeof body?.timeSpentMs === 'number' ? body.timeSpentMs : body?.time_spent_ms ?? 0)
    const hintsUsed = Math.max(0, typeof body?.hintsUsed === 'number' ? body.hintsUsed : body?.hints_used ?? 0)
    const responses = body?.responses ?? {}

    if (!sessionToken) {
      return new Response(
        JSON.stringify({ message: 'sessionToken required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: session, error: sessionErr } = await supabase
      .from('child_sessions')
      .select('id, child_id, study_id')
      .eq('token', sessionToken)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (sessionErr || !session) {
      return new Response(
        JSON.stringify({ message: 'Invalid or expired session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: attempt, error: attemptErr } = await supabase
      .from('study_attempts')
      .insert({
        session_id: session.id,
        activity_id: activityId,
        activity_type: activityType,
        score,
        time_spent_ms: timeSpentMs,
        hints_used: hintsUsed,
        responses: typeof responses === 'object' ? responses : {},
        ended_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (attemptErr) {
      return new Response(
        JSON.stringify({ message: attemptErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: progress } = await supabase
      .from('progress_summary')
      .select('total_score, total_time_ms, attempt_count, last_attempt_at')
      .eq('child_id', session.child_id)
      .eq('study_id', session.study_id)
      .single()

    return new Response(
      JSON.stringify({
        success: true,
        attemptId: attempt?.id ?? '',
        updatedProgress: {
          totalScore: progress?.total_score ?? score,
          totalTimeMs: progress?.total_time_ms ?? timeSpentMs,
          attemptCount: progress?.attempt_count ?? 1,
          lastAttemptAt: progress?.last_attempt_at ?? new Date().toISOString(),
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
