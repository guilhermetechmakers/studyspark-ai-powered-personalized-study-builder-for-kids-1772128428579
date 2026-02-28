/**
 * Dashboard API - Supabase-backed data for overview, children, and recent studies.
 * Uses Supabase client directly. No mock fallbacks; returns empty arrays when no data.
 */

import { supabase } from '@/lib/supabase'
import { fetchChildProfiles } from '@/api/profile'
import type { ChildProfile } from '@/types/profile'
import type { Child, Study, Recommendation, DashboardOverview } from '@/types/dashboard'
import { asArray } from '@/lib/data-guard'

const hasSupabase = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
)

/** Map study status from DB to dashboard Study status */
function mapStudyStatus(dbStatus: string): Study['status'] {
  switch (dbStatus) {
    case 'ready':
    case 'exported':
      return 'completed'
    case 'drafting':
    case 'streaming':
      return 'in-progress'
    default:
      return 'saved'
  }
}

/** Format relative time (e.g. "2 hours ago") */
function formatRelativeTime(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 60) return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`
  if (diffHours < 24) return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
  if (diffDays < 7) return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`
  return d.toLocaleDateString()
}

/** Fetch children with progress/streak from progress_summary */
export async function fetchChildren(): Promise<Child[]> {
  if (!hasSupabase) return []
  const profiles = await fetchChildProfiles()
  if (profiles.length === 0) return []

  const childIds = profiles.map((p) => p.id)
  const { data: progressRows } = await supabase
    .from('progress_summary')
    .select('child_id, total_score, total_time_ms, attempt_count, last_attempt_at')
    .in('child_id', childIds)

  const progressByChild: Record<string, { progress: number; lastActive: string }> = {}
  for (const row of asArray<Record<string, unknown>>(progressRows ?? [])) {
    const cid = String(row.child_id ?? '')
    if (!cid) continue
    const totalScore = Number(row.total_score ?? 0)
    const attemptCount = Number(row.attempt_count ?? 1)
    const progress = attemptCount > 0 ? Math.min(100, Math.round((totalScore / (attemptCount * 10)) * 100)) : 0
    const lastAt = row.last_attempt_at ? String(row.last_attempt_at) : ''
    const existing = progressByChild[cid]
    if (!existing || (lastAt && (!existing.lastActive || lastAt > existing.lastActive))) {
      progressByChild[cid] = {
        progress: existing ? Math.max(existing.progress, progress) : progress,
        lastActive: formatRelativeTime(lastAt),
      }
    }
  }

  return profiles.map((p: ChildProfile) => {
    const prog = progressByChild[p.id]
    return {
      id: p.id,
      name: p.name,
      age: p.age,
      progress: prog?.progress ?? 0,
      streak: 0, // Streak requires date-range logic; keep 0 for now
      lastActive: prog?.lastActive,
    }
  })
}

/** Fetch recent studies from database */
export async function fetchStudies(limit = 10): Promise<Study[]> {
  if (!hasSupabase) return []
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: rows, error } = await supabase
    .from('studies')
    .select('id, title, topic, status, updated_at, created_at')
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) return []

  return asArray<Record<string, unknown>>(rows ?? []).map((r) => ({
    id: String(r.id ?? ''),
    title: String(r.title ?? r.topic ?? 'Untitled'),
    updatedAt: formatRelativeTime(String(r.updated_at ?? r.created_at ?? '')),
    status: mapStudyStatus(String(r.status ?? 'draft')),
  }))
}

/** Fetch AI recommendations - no table yet; returns empty array */
export async function fetchRecommendations(): Promise<Recommendation[]> {
  return []
}

/** Fetch overview metrics (totals) */
export async function fetchOverview(): Promise<DashboardOverview> {
  if (!hasSupabase) {
    return { childrenCount: 0, studiesCount: 0 }
  }
  const [children, studiesResult] = await Promise.all([
    fetchChildren(),
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { count: 0 }
      const { count, error } = await supabase
        .from('studies')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_deleted', false)
      if (error) return { count: 0 }
      return { count: count ?? 0 }
    })(),
  ])
  return {
    childrenCount: children.length,
    studiesCount: studiesResult.count,
  }
}
