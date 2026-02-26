/**
 * Study Player API - Sessions, attempts, progress, analytics.
 * Uses Supabase Edge Functions and direct Supabase client.
 * All responses validated with safe defaults; guards against null/undefined.
 */

import { supabase } from '@/lib/supabase'
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  SubmitAttemptRequest,
  SubmitAttemptResponse,
  ParentAnalyticsResponse,
} from '@/types/study-player'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`
  }
  return headers
}

/** Create child session for study play */
export async function createSession(
  payload: CreateSessionRequest
): Promise<CreateSessionResponse> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${supabaseUrl}/functions/v1/sessions-create`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      childId: payload.childId,
      studyId: payload.studyId,
    }),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(err?.message ?? res.statusText)
  }
  const data = (await res.json()) as CreateSessionResponse
  return {
    sessionToken: data.sessionToken ?? '',
    sessionId: data.sessionId ?? '',
    expiresAt: data.expiresAt ?? '',
    activityIds: Array.isArray(data.activityIds) ? data.activityIds : [],
  }
}

/** Submit activity attempt (uses session token, no auth header) */
export async function submitAttempt(
  payload: SubmitAttemptRequest
): Promise<SubmitAttemptResponse> {
  const res = await fetch(`${supabaseUrl}/functions/v1/activities-attempt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionToken: payload.sessionToken,
      activityId: payload.activityId,
      score: payload.score,
      timeSpentMs: payload.timeSpentMs,
      hintsUsed: payload.hintsUsed ?? 0,
      responses: payload.responses ?? {},
    }),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(err?.message ?? res.statusText)
  }
  const data = (await res.json()) as SubmitAttemptResponse
  return {
    success: data.success ?? false,
    attemptId: data.attemptId,
    updatedProgress: data.updatedProgress,
  }
}

/** Fetch parent analytics (requires auth) */
export async function fetchParentAnalytics(
  childId?: string,
  range?: string
): Promise<ParentAnalyticsResponse> {
  const headers = await getAuthHeaders()
  const params = new URLSearchParams()
  if (childId) params.set('childId', childId)
  if (range) params.set('range', range)
  const qs = params.toString()
  const url = `${supabaseUrl}/functions/v1/parent-analytics${qs ? `?${qs}` : ''}`
  const res = await fetch(url, { method: 'GET', headers })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(err?.message ?? res.statusText)
  }
  const data = (await res.json()) as Record<string, unknown>
  const totalTimeMs = Number(data.totalTimeMs) ?? 0
  const byStudy = Array.isArray(data.byStudy) ? data.byStudy : []
  const byDay = Array.isArray(data.byDay) ? data.byDay : []
  const metrics = data.metrics as Record<string, unknown> | undefined
  const totalPoints = metrics ? Number(metrics.totalPoints) : byStudy.reduce((s: number, x: { totalScore?: number }) => s + (Number(x.totalScore) ?? 0), 0)
  return {
    children: Array.isArray(data.children) ? data.children : [],
    metrics: {
      totalPoints,
      totalTimeMinutes: Math.round(totalTimeMs / 60000),
      averageScore: Number(data.averageScore) ?? Number(metrics?.averageScore) ?? 0,
      streak: Number(data.streakDays) ?? Number(metrics?.streak) ?? 0,
      attemptCount: Number(data.totalAttempts) ?? 0,
    },
    timeByDay: byDay,
    masteryByTopic: Array.isArray(data.masteryByTopic) ? data.masteryByTopic : [],
    byStudy,
    byDay,
    streaks: Array.isArray(data.streaks) ? data.streaks : [],
  }
}
