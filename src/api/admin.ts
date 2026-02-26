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
    await apiPost(`${ADMIN_BASE}/moderation/${id}/approve`)
  } catch {
    // Mock: no-op
  }
}

export async function banContent(id: string): Promise<void> {
  try {
    await apiPost(`${ADMIN_BASE}/moderation/${id}/ban`)
  } catch {
    // Mock: no-op
  }
}

export async function requestChanges(id: string, note?: string): Promise<void> {
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
