/**
 * Supabase Edge Function: progress-query
 * Queries progress for a child/study (parent JWT required).
 * GET /functions/v1/progress-query?childId=&studyId=&range=
 * Returns: [{ activityId, totalScore, totalTime, attempts, lastAttemptAt }, ...]
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

    const url = new URL(req.url)
    const childId = url.searchParams.get('childId') ?? url.searchParams.get('child_id') ?? ''
    const studyId = url.searchParams.get('studyId') ?? url.searchParams.get('study_id') ?? ''
    const range = url.searchParams.get('range') ?? 'all'

    const { data: children } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('user_id', user.id)
    const childIds = Array.isArray(children) ? children.map((c: { id: string }) => c.id) : []

    if (childIds.length === 0) {
      return new Response(
        JSON.stringify({ data: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let query = supabase
      .from('progress_summary')
      .select('id, child_id, study_id, total_score, total_time_ms, attempt_count, last_attempt_at, updated_at')
      .in('child_id', childIds)

    if (childId) query = query.eq('child_id', childId)
    if (studyId) query = query.eq('study_id', studyId)

    if (range === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      query = query.gte('last_attempt_at', weekAgo.toISOString())
    } else if (range === 'month') {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      query = query.gte('last_attempt_at', monthAgo.toISOString())
    }

    const { data, error } = await query.order('last_attempt_at', { ascending: false })

    if (error) {
      return new Response(
        JSON.stringify({ message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const items = Array.isArray(data) ? data : []
    const result = items.map((p: Record<string, unknown>) => ({
      childId: p.child_id,
      studyId: p.study_id,
      totalScore: p.total_score ?? 0,
      totalTimeMs: p.total_time_ms ?? 0,
      attemptCount: p.attempt_count ?? 0,
      lastAttemptAt: p.last_attempt_at ?? null,
    }))

    return new Response(
      JSON.stringify({ data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
