/**
 * Admin API - Supabase Edge Functions.
 * Used when VITE_SUPABASE_URL is set. Falls back to main admin API (which uses mock).
 */

import type {
  AnalyticsKpis,
  SystemHealthSummary,
  ContentItem,
  AuditLogEntry,
  SystemLog,
} from '@/types/admin'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`
    }
  } catch {
    // ignore
  }
  return headers
}

export async function fetchAdminDashboard(): Promise<{
  kpis: AnalyticsKpis
  health: SystemHealthSummary
}> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) {
    throw new Error('Not authenticated')
  }
  const res = await fetch(`${supabaseUrl}/functions/v1/admin-dashboard`, {
    method: 'GET',
    headers,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string })?.message ?? res.statusText)
  }
  const json = (await res.json()) as { data?: { kpis?: AnalyticsKpis; health?: SystemHealthSummary } }
  const data = json?.data ?? {}
  return {
    kpis: data.kpis ?? { mau: 0, mrr: 0, churn: 0, newSignups: 0, activeSubscriptions: 0, creationVolume: 0 },
    health: data.health ?? { queueBacklog: 0, aiApiUsage: 0, errorCount: 0 },
  }
}

export async function fetchAdminModerationQueue(params?: {
  status?: string
  type?: string
  limit?: number
  offset?: number
}): Promise<ContentItem[]> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) {
    throw new Error('Not authenticated')
  }
  const search = new URLSearchParams()
  if (params?.status) search.set('status', params.status)
  if (params?.type) search.set('type', params.type)
  if (params?.limit != null) search.set('limit', String(params.limit))
  if (params?.offset != null) search.set('offset', String(params.offset))
  const res = await fetch(
    `${supabaseUrl}/functions/v1/admin-moderation-queue?${search.toString()}`,
    { method: 'GET', headers }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string })?.message ?? res.statusText)
  }
  const json = (await res.json()) as ContentItem[] | { data?: ContentItem[] }
  return Array.isArray(json) ? json : (json?.data ?? [])
}

export async function submitAdminModerationAction(payload: {
  action: string
  ids?: string[]
  id?: string
  payload?: Record<string, unknown>
}): Promise<void> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) {
    throw new Error('Not authenticated')
  }
  const res = await fetch(`${supabaseUrl}/functions/v1/admin-moderation-queue`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string })?.message ?? res.statusText)
  }
}

export async function fetchAdminAuditLogs(params?: {
  action?: string
  target_type?: string
  limit?: number
  offset?: number
}): Promise<{ data: AuditLogEntry[]; count: number }> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) {
    throw new Error('Not authenticated')
  }
  const search = new URLSearchParams()
  if (params?.action) search.set('action', params.action)
  if (params?.target_type) search.set('target_type', params.target_type)
  if (params?.limit != null) search.set('limit', String(params.limit))
  if (params?.offset != null) search.set('offset', String(params.offset))
  const res = await fetch(
    `${supabaseUrl}/functions/v1/admin-audit-logs?${search.toString()}`,
    { method: 'GET', headers }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string })?.message ?? res.statusText)
  }
  const json = (await res.json()) as { data?: AuditLogEntry[]; count?: number }
  const data = Array.isArray(json?.data) ? json.data : []
  return { data, count: json?.count ?? data.length }
}

export async function fetchAdminAuditLogsCSV(params?: {
  action?: string
  target_type?: string
}): Promise<Blob> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) {
    throw new Error('Not authenticated')
  }
  const search = new URLSearchParams()
  search.set('format', 'csv')
  if (params?.action) search.set('action', params.action)
  if (params?.target_type) search.set('target_type', params.target_type)
  const res = await fetch(
    `${supabaseUrl}/functions/v1/admin-audit-logs?${search.toString()}`,
    { method: 'GET', headers }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string })?.message ?? res.statusText)
  }
  return res.blob()
}

export async function fetchAdminHealth(): Promise<{
  summary: SystemHealthSummary
  logs: SystemLog[]
}> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) {
    throw new Error('Not authenticated')
  }
  const res = await fetch(`${supabaseUrl}/functions/v1/admin-health`, {
    method: 'GET',
    headers,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string })?.message ?? res.statusText)
  }
  const json = (await res.json()) as { data?: { summary?: SystemHealthSummary; logs?: SystemLog[] } }
  const data = json?.data ?? {}
  return {
    summary: data.summary ?? { queueBacklog: 0, aiApiUsage: 0, errorCount: 0 },
    logs: Array.isArray(data.logs) ? data.logs : [],
  }
}
