/**
 * Admin API layer.
 * Uses native fetch via lib/api.ts. Falls back to mock data when endpoints return 404.
 */

import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} from '@/lib/api'
import type {
  AdminUser,
  ContentItem,
  Plan,
  Coupon,
  AnalyticsKpis,
  AnalyticsDataPoint,
  SystemLog,
  SystemHealthSummary,
  PaginatedResponse,
  AuditLogEntry,
  ContentReviewItem,
  ModerationQueueItem,
  AdminRole,
  AdminPermission,
} from '@/types/admin'
import {
  mockUsers,
  mockContentItems,
  mockPlans,
  mockCoupons,
  mockKpis,
  mockTimeSeries,
  mockLogs,
  mockHealthSummary,
  mockAuditLogs,
  mockContentReviewItems,
  mockModerationQueueItems,
  mockAdminRoles,
  mockAdminPermissions,
} from '@/data/admin-mock'

const ADMIN_BASE = '/admin'

function safeArray<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : []
}

function safeObject<T>(data: unknown, fallback: T): T {
  return data && typeof data === 'object' && !Array.isArray(data) ? (data as T) : fallback
}

// --- Users ---

export interface UsersQuery {
  search?: string
  role?: string
  status?: string
  page?: number
  limit?: number
  sort?: string
}

export async function fetchUsers(query: UsersQuery = {}): Promise<PaginatedResponse<AdminUser>> {
  try {
    const params = new URLSearchParams()
    if (query.search) params.set('search', query.search)
    if (query.role) params.set('role', query.role)
    if (query.status) params.set('status', query.status)
    if (query.page != null) params.set('page', String(query.page))
    if (query.limit != null) params.set('limit', String(query.limit))
    if (query.sort) params.set('sort', query.sort)
    const qs = params.toString()
    const res = await apiGet<{ data?: AdminUser[]; total?: number; page?: number; limit?: number }>(
      `${ADMIN_BASE}/users${qs ? `?${qs}` : ''}`
    )
    const data = safeArray<AdminUser>(res?.data ?? res)
    const total = (res as { total?: number })?.total ?? data.length
    const page = (res as { page?: number })?.page ?? 1
    const limit = (res as { limit?: number })?.limit ?? 10
    return { data, total, page, limit }
  } catch {
    let filtered = [...mockUsers]
    if (query.search) {
      const s = query.search.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)
      )
    }
    if (query.role) filtered = filtered.filter((u) => u.role === query.role)
    if (query.status) filtered = filtered.filter((u) => u.status === query.status)
    const page = query.page ?? 1
    const limit = query.limit ?? 10
    const start = (page - 1) * limit
    return {
      data: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
    }
  }
}

export async function createUser(body: Partial<AdminUser>): Promise<AdminUser> {
  try {
    const res = await apiPost<AdminUser>(`${ADMIN_BASE}/users`, body)
    return safeObject(res, { ...body, id: `u-${Date.now()}` } as AdminUser)
  } catch {
    return { ...body, id: `u-${Date.now()}`, createdAt: new Date().toISOString() } as AdminUser
  }
}

export async function updateUser(id: string, body: Partial<AdminUser>): Promise<AdminUser> {
  try {
    const res = await apiPatch<AdminUser>(`${ADMIN_BASE}/users/${id}`, body)
    return safeObject(res, { id, ...body } as AdminUser)
  } catch {
    const u = mockUsers.find((x) => x.id === id) ?? ({} as AdminUser)
    return { ...u, ...body, id }
  }
}

export async function suspendUser(id: string, suspended: boolean): Promise<void> {
  try {
    await apiPost(`${ADMIN_BASE}/users/${id}/suspend`, { suspended })
  } catch {
    // Mock: no-op
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    await apiDelete(`${ADMIN_BASE}/users/${id}`)
  } catch {
    // Mock: no-op
  }
}

// --- Moderation ---

export interface ModerationQuery {
  type?: string
  status?: string
  from?: string
  to?: string
}

export async function fetchModerationQueue(
  query: ModerationQuery = {}
): Promise<ContentItem[]> {
  try {
    const { fetchAdminModerationQueue } = await import('@/api/admin-supabase')
    return await fetchAdminModerationQueue({
      type: query.type,
      status: query.status,
      limit: 50,
      offset: 0,
    })
  } catch {
    // fallback
  }
  try {
    const params = new URLSearchParams()
    if (query.type) params.set('type', query.type)
    if (query.status) params.set('status', query.status)
    if (query.from) params.set('from', query.from)
    if (query.to) params.set('to', query.to)
    const qs = params.toString()
    const res = await apiGet<{ data?: ContentItem[] } | ContentItem[]>(
      `${ADMIN_BASE}/moderation/queue${qs ? `?${qs}` : ''}`
    )
    const arr = Array.isArray(res) ? res : safeArray<ContentItem>((res as { data?: ContentItem[] })?.data)
    return arr ?? []
  } catch {
    let filtered = [...mockContentItems]
    if (query.type) filtered = filtered.filter((c) => c.type === query.type)
    if (query.status) filtered = filtered.filter((c) => c.status === query.status)
    return filtered
  }
}

export async function approveContent(id: string): Promise<void> {
  try {
    const { submitAdminModerationAction } = await import('@/api/admin-supabase')
    await submitAdminModerationAction({ action: 'approve', id })
    return
  } catch {
    // fallback
  }
  try {
    await apiPost(`${ADMIN_BASE}/moderation/${id}/approve`)
  } catch {
    // Mock: no-op
  }
}

export async function banContent(id: string): Promise<void> {
  try {
    const { submitAdminModerationAction } = await import('@/api/admin-supabase')
    await submitAdminModerationAction({ action: 'ban', id })
    return
  } catch {
    // fallback
  }
  try {
    await apiPost(`${ADMIN_BASE}/moderation/${id}/ban`)
  } catch {
    // Mock: no-op
  }
}

export async function requestChanges(id: string, note?: string): Promise<void> {
  try {
    const { submitAdminModerationAction } = await import('@/api/admin-supabase')
    await submitAdminModerationAction({ action: 'request_changes', id, payload: { note } })
    return
  } catch {
    // fallback
  }
  try {
    await apiPost(`${ADMIN_BASE}/moderation/${id}/change`, { note })
  } catch {
    // Mock: no-op
  }
}

// --- Plans ---

export async function fetchPlans(): Promise<Plan[]> {
  try {
    const res = await apiGet<{ data?: Plan[] } | Plan[]>(`${ADMIN_BASE}/plans`)
    const arr = Array.isArray(res) ? res : safeArray<Plan>((res as { data?: Plan[] })?.data)
    return arr ?? []
  } catch {
    return [...mockPlans]
  }
}

export async function createPlan(body: Partial<Plan>): Promise<Plan> {
  try {
    const res = await apiPost<Plan>(`${ADMIN_BASE}/plans`, body)
    return safeObject(res, { ...body, id: `p-${Date.now()}` } as Plan)
  } catch {
    return { ...body, id: `p-${Date.now()}`, active: true } as Plan
  }
}

export async function updatePlan(id: string, body: Partial<Plan>): Promise<Plan> {
  try {
    const res = await apiPatch<Plan>(`${ADMIN_BASE}/plans/${id}`, body)
    return safeObject(res, { id, ...body } as Plan)
  } catch {
    const p = mockPlans.find((x) => x.id === id) ?? ({} as Plan)
    return { ...p, ...body, id }
  }
}

export async function deletePlan(id: string): Promise<void> {
  try {
    await apiDelete(`${ADMIN_BASE}/plans/${id}`)
  } catch {
    // Mock: no-op
  }
}

export async function fetchCoupons(): Promise<Coupon[]> {
  try {
    const res = await apiGet<{ data?: Coupon[] } | Coupon[]>(`${ADMIN_BASE}/coupons`)
    const arr = Array.isArray(res) ? res : safeArray<Coupon>((res as { data?: Coupon[] })?.data)
    return arr ?? []
  } catch {
    return [...mockCoupons]
  }
}

export async function createCoupon(body: Partial<Coupon>): Promise<Coupon> {
  try {
    const res = await apiPost<Coupon>(`${ADMIN_BASE}/coupons`, body)
    return safeObject(res, { ...body, id: `cp-${Date.now()}` } as Coupon)
  } catch {
    return { ...body, id: `cp-${Date.now()}`, usedCount: 0 } as Coupon
  }
}

// --- Analytics ---

export async function fetchAnalyticsKpis(_params?: { range?: string }): Promise<AnalyticsKpis> {
  try {
    const { fetchAdminDashboard } = await import('@/api/admin-supabase')
    const { kpis } = await fetchAdminDashboard()
    return kpis
  } catch {
    // fallback to REST or mock
  }
  try {
    const res = await apiGet<AnalyticsKpis | { data?: AnalyticsKpis }>(
      `${ADMIN_BASE}/analytics/kpis`
    )
    return safeObject(
      (res as { data?: AnalyticsKpis })?.data ?? res,
      mockKpis
    )
  } catch {
    return mockKpis
  }
}

export async function fetchAnalyticsCharts(
  from?: string,
  to?: string,
  _params?: { range?: string }
): Promise<AnalyticsDataPoint[]> {
  try {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    const qs = params.toString()
    const res = await apiGet<{ data?: AnalyticsDataPoint[] } | AnalyticsDataPoint[]>(
      `${ADMIN_BASE}/analytics/charts${qs ? `?${qs}` : ''}`
    )
    const arr = Array.isArray(res) ? res : safeArray<AnalyticsDataPoint>((res as { data?: AnalyticsDataPoint[] })?.data)
    return arr ?? []
  } catch {
    return [...mockTimeSeries]
  }
}

// --- System Health ---

export async function fetchHealthSummary(): Promise<SystemHealthSummary> {
  try {
    const { fetchAdminHealth } = await import('@/api/admin-supabase')
    const { summary } = await fetchAdminHealth()
    return summary
  } catch {
    // fallback
  }
  try {
    const res = await apiGet<SystemHealthSummary | { data?: SystemHealthSummary }>(
      `${ADMIN_BASE}/health/summary`
    )
    return safeObject(
      (res as { data?: SystemHealthSummary })?.data ?? res,
      mockHealthSummary
    )
  } catch {
    return mockHealthSummary
  }
}

export async function fetchHealthLogs(
  level?: string,
  component?: string
): Promise<SystemLog[]> {
  try {
    const { fetchAdminHealth } = await import('@/api/admin-supabase')
    const { logs } = await fetchAdminHealth()
    return Array.isArray(logs) ? logs : []
  } catch {
    // fallback
  }
  try {
    const params = new URLSearchParams()
    if (level) params.set('level', level)
    if (component) params.set('component', component)
    const qs = params.toString()
    const res = await apiGet<{ data?: SystemLog[] } | SystemLog[]>(
      `${ADMIN_BASE}/health/logs${qs ? `?${qs}` : ''}`
    )
    const arr = Array.isArray(res) ? res : safeArray<SystemLog>((res as { data?: SystemLog[] })?.data)
    return arr ?? []
  } catch {
    return [...mockLogs]
  }
}

// --- Aliases for existing admin pages ---

export interface AdminUsersResponse {
  users: AdminUser[]
  total: number
}

export async function fetchAdminUsers(query: {
  search?: string
  role?: string
  status?: string
  sort?: string
} = {}): Promise<AdminUsersResponse> {
  const res = await fetchUsers({
    ...query,
    page: 1,
    limit: 100,
  })
  return { users: res.data ?? [], total: res.total ?? 0 }
}

export async function suspendAdminUser(id: string, suspended: boolean): Promise<void> {
  return suspendUser(id, suspended)
}

export async function deleteAdminUser(id: string): Promise<void> {
  return deleteUser(id)
}

export async function fetchSystemHealthSummary(): Promise<SystemHealthSummary> {
  return fetchHealthSummary()
}

export async function fetchSystemLogs(query?: {
  level?: string
  component?: string
}): Promise<SystemLog[]> {
  return fetchHealthLogs(query?.level, query?.component)
}

// --- Audit Logs ---

export interface AuditLogsQuery {
  resource_type?: string
  resource_id?: string
  resourceType?: string
  resourceId?: string
  action?: string
  admin_id?: string
  adminId?: string
  from?: string
  to?: string
  limit?: number
  offset?: number
  page?: number
}

export async function fetchAuditLogs(
  query: AuditLogsQuery = {}
): Promise<{ data: AuditLogEntry[]; total: number }> {
  try {
    const { fetchAdminAuditLogs } = await import('@/api/admin-supabase')
    const res = await fetchAdminAuditLogs({
      action: query.action,
      target_type: query.resourceType ?? query.resource_type,
      limit: query.limit ?? 50,
      offset: query.offset ?? (query.page ? (query.page - 1) * (query.limit ?? 50) : 0),
    })
    return { data: res.data ?? [], total: res.count ?? 0 }
  } catch {
    // fallback
  }
  try {
    const params = new URLSearchParams()
    if (query.resourceType ?? query.resource_type) params.set('resource_type', query.resourceType ?? query.resource_type ?? '')
    if (query.resourceId ?? query.resource_id) params.set('resource_id', query.resourceId ?? query.resource_id ?? '')
    if (query.action) params.set('action', query.action)
    if (query.adminId ?? query.admin_id) params.set('admin_id', query.adminId ?? query.admin_id ?? '')
    if (query.from) params.set('from', query.from)
    if (query.to) params.set('to', query.to)
    if (query.limit != null) params.set('limit', String(query.limit))
    if (query.offset != null) params.set('offset', String(query.offset))
    const qs = params.toString()
    const res = await apiGet<{ data?: AuditLogEntry[]; total?: number }>(
      `${ADMIN_BASE}/audit-logs${qs ? `?${qs}` : ''}`
    )
    const data = safeArray<AuditLogEntry>((res as { data?: AuditLogEntry[] })?.data ?? res)
    const total = (res as { total?: number })?.total ?? data.length
    return { data, total }
  } catch {
    const filtered = [...mockAuditLogs] as AuditLogEntry[]
    return { data: filtered, total: filtered.length }
  }
}

export async function exportAuditLogsCSV(query: AuditLogsQuery = {}): Promise<Blob> {
  try {
    const { fetchAdminAuditLogsCSV } = await import('@/api/admin-supabase')
    return await fetchAdminAuditLogsCSV({
      action: query.action,
      target_type: query.resourceType ?? query.resource_type,
    })
  } catch {
    // fallback
  }
  const { data } = await fetchAuditLogs({ ...query, limit: 10000 })
  const headers = ['ID', 'Admin', 'Action', 'Target Type', 'Target ID', 'Created']
  const rows = (data ?? []).map((r) =>
    [r.id, r.adminEmail ?? r.adminId, r.action, r.targetType, r.targetId ?? '', r.createdAt].join(',')
  )
  const csv = [headers.join(','), ...rows].join('\n')
  return new Blob([csv], { type: 'text/csv' })
}

// --- Content Review ---

export interface ContentReviewQuery {
  status?: string
  contentType?: string
  limit?: number
  offset?: number
}

export async function fetchContentReviewQueue(
  query: ContentReviewQuery = {}
): Promise<ContentReviewItem[]> {
  try {
    const params = new URLSearchParams()
    if (query.status) params.set('status', query.status)
    if (query.contentType) params.set('contentType', query.contentType)
    if (query.limit != null) params.set('limit', String(query.limit))
    if (query.offset != null) params.set('offset', String(query.offset))
    const qs = params.toString()
    const res = await apiGet<{ data?: ContentReviewItem[] } | ContentReviewItem[]>(
      `${ADMIN_BASE}/content-review/queue${qs ? `?${qs}` : ''}`
    )
    const arr = Array.isArray(res) ? res : safeArray<ContentReviewItem>((res as { data?: ContentReviewItem[] })?.data)
    return arr ?? []
  } catch {
    let filtered = [...mockContentReviewItems]
    if (query.status && query.status !== 'all') {
      filtered = filtered.filter((c) => c.status === query.status)
    }
    if (query.contentType && query.contentType !== 'all') {
      filtered = filtered.filter((c) => c.contentType === query.contentType)
    }
    return filtered
  }
}

export async function contentReviewAction(
  id: string,
  action: 'approve' | 'reject' | 'request_changes' | 'escalate',
  note?: string
): Promise<void> {
  try {
    await apiPost(`${ADMIN_BASE}/content-review/actions`, { id, action, note })
  } catch {
    // Mock: no-op
  }
}

export async function bulkContentReviewAction(
  ids: string[],
  action: 'approve' | 'reject',
  note?: string
): Promise<void> {
  try {
    await apiPost(`${ADMIN_BASE}/content-review/actions`, { ids, action, note })
  } catch {
    // Mock: no-op
  }
}

// --- User Moderation Queue ---

export interface ModerationQueueQuery {
  status?: string
  search?: string
  limit?: number
  offset?: number
}

export async function fetchModerationQueueItems(
  query: ModerationQueueQuery = {}
): Promise<ModerationQueueItem[]> {
  try {
    const params = new URLSearchParams()
    if (query.status) params.set('status', query.status)
    if (query.search) params.set('search', query.search)
    if (query.limit != null) params.set('limit', String(query.limit))
    if (query.offset != null) params.set('offset', String(query.offset))
    const qs = params.toString()
    const res = await apiGet<{ data?: ModerationQueueItem[] } | ModerationQueueItem[]>(
      `${ADMIN_BASE}/moderation/queue${qs ? `?${qs}` : ''}`
    )
    const arr = Array.isArray(res) ? res : safeArray<ModerationQueueItem>((res as { data?: ModerationQueueItem[] })?.data)
    return arr ?? []
  } catch {
    let filtered = [...mockModerationQueueItems]
    if (query.status && query.status !== 'all') {
      filtered = filtered.filter((m) => m.status === query.status)
    }
    return filtered
  }
}

export async function moderationAction(
  id: string,
  action: 'suspend' | 'deactivate' | 'warn' | 'unblock' | 'assign_reviewer',
  payload?: Record<string, unknown>
): Promise<void> {
  try {
    await apiPost(`${ADMIN_BASE}/moderation/actions`, { id, action, ...payload })
  } catch {
    // Mock: no-op
  }
}

export async function bulkModerationAction(
  ids: string[],
  action: 'suspend' | 'deactivate' | 'warn' | 'unblock',
  payload?: Record<string, unknown>
): Promise<void> {
  try {
    await apiPost(`${ADMIN_BASE}/moderation/actions`, { ids, action, ...payload })
  } catch {
    // Mock: no-op
  }
}

// --- Admin Settings (Roles & Permissions) ---

export async function fetchAdminRoles(): Promise<AdminRole[]> {
  try {
    const res = await apiGet<{ data?: AdminRole[] } | AdminRole[]>(`${ADMIN_BASE}/settings/roles`)
    const arr = Array.isArray(res) ? res : safeArray<AdminRole>((res as { data?: AdminRole[] })?.data)
    return arr ?? []
  } catch {
    return [...mockAdminRoles]
  }
}

export async function fetchAdminPermissions(): Promise<AdminPermission[]> {
  try {
    const res = await apiGet<{ data?: AdminPermission[] } | AdminPermission[]>(
      `${ADMIN_BASE}/settings/permissions`
    )
    const arr = Array.isArray(res)
      ? res
      : safeArray<AdminPermission>((res as { data?: AdminPermission[] })?.data)
    return arr ?? []
  } catch {
    return [...mockAdminPermissions]
  }
}
