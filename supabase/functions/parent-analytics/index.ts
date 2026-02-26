/**
 * Supabase Edge Function: parent-analytics
 * Aggregated analytics for parent dashboard (time spent, mastery, streaks).
 * GET /functions/v1/parent-analytics?childId=&range=week|month|all
 * Returns: { totalTimeMs, averageScore, streakDays, byStudy, byDay }
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
    const range = url.searchParams.get('range') ?? 'month'

    const { data: children } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('user_id', user.id)
    const childIds = Array.isArray(children) ? children.map((c: { id: string }) => c.id) : []
    const filterChildIds = childId ? [childId].filter((id) => childIds.includes(id)) : childIds

    if (filterChildIds.length === 0) {
      return new Response(
        JSON.stringify({
          totalTimeMs: 0,
          averageScore: 0,
          streakDays: 0,
          byStudy: [],
          byDay: [],
          totalAttempts: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const rangeDate = new Date()
    if (range === 'week') rangeDate.setDate(rangeDate.getDate() - 7)
    else if (range === 'month') rangeDate.setMonth(rangeDate.getMonth() - 1)
    else if (range === 'all') rangeDate.setFullYear(2000)

    const { data: progressList } = await supabase
      .from('progress_summary')
      .select('child_id, study_id, total_score, total_time_ms, attempt_count, last_attempt_at')
      .in('child_id', filterChildIds)
      .gte('last_attempt_at', rangeDate.toISOString())

    const items = Array.isArray(progressList) ? progressList : []
    const totalTimeMs = items.reduce((s, p) => s + (p.total_time_ms ?? 0), 0)
    const totalScore = items.reduce((s, p) => s + (p.total_score ?? 0), 0)
    const totalAttempts = items.reduce((s, p) => s + (p.attempt_count ?? 0), 0)
    const averageScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0

    const studyIds = [...new Set(items.map((p) => p.study_id).filter(Boolean))]
    const { data: studies } = await supabase
      .from('studies')
      .select('id, topic')
      .in('id', studyIds)
    const studyMap = Object.fromEntries(
      (Array.isArray(studies) ? studies : []).map((s: { id: string; topic: string }) => [s.id, s.topic])
    )

    const byStudy = items.map((p) => ({
      studyId: p.study_id,
      topic: studyMap[p.study_id] ?? 'Unknown',
      totalScore: p.total_score ?? 0,
      totalTimeMs: p.total_time_ms ?? 0,
      attemptCount: p.attempt_count ?? 0,
    }))

    const { data: sessions } = await supabase
      .from('child_sessions')
      .select('id')
      .in('child_id', filterChildIds)
    const sessionIds = Array.isArray(sessions) ? sessions.map((s: { id: string }) => s.id) : []

    const { data: attempts } = sessionIds.length > 0
      ? await supabase.from('attempts').select('started_at, time_spent_ms').in('session_id', sessionIds)
      : { data: [] }

    const byDayMap: Record<string, { count: number; minutes: number }> = {}
    for (const a of Array.isArray(attempts) ? attempts : []) {
      const d = (a.started_at ?? '').slice(0, 10)
      if (d) {
        if (!byDayMap[d]) byDayMap[d] = { count: 0, minutes: 0 }
        byDayMap[d].count += 1
        byDayMap[d].minutes += Math.round((a.time_spent_ms ?? 0) / 60000)
      }
    }
    const byDay = Object.entries(byDayMap)
      .map(([date, v]) => ({ date, count: v.count, minutes: v.minutes }))
      .sort((a, b) => a.date.localeCompare(b.date))

    let streakDays = 0
    const today = new Date().toISOString().slice(0, 10)
    const dates = Object.keys(byDayMap).sort()
    const lastIdx = dates.indexOf(today)
    if (lastIdx >= 0) {
      for (let i = lastIdx; i >= 0; i--) {
        const expected = new Date()
        expected.setDate(expected.getDate() - (lastIdx - i))
        if (dates[i] === expected.toISOString().slice(0, 10)) streakDays++
        else break
      }
    }

    return new Response(
      JSON.stringify({
        totalTimeMs,
        averageScore,
        streakDays,
        byStudy,
        byDay,
        totalAttempts,
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
