/**
 * Notifications API - in-app notifications, preferences, email templates.
 * Uses Supabase Edge Functions.
 */

import type {
  InAppNotification,
  InAppListResponse,
  NotificationPreferences,
  NotificationPreferencesResponse,
} from '@/types/notifications'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlBody: string
  textBody: string | null
  placeholders: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface DeliveryStats {
  total: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  failed: number
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
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

export interface ListInAppParams {
  limit?: number
  offset?: number
  type?: string
  unreadOnly?: boolean
}

/** GET in-app notifications list */
export async function listInAppNotifications(
  params: ListInAppParams = {}
): Promise<{ data: InAppNotification[]; count: number }> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) {
    return { data: [], count: 0 }
  }

  const limit = params.limit ?? 20
  const offset = params.offset ?? 0
  const search = new URLSearchParams()
  search.set('limit', String(limit))
  search.set('offset', String(offset))
  if (params.type) search.set('type', params.type)
  if (params.unreadOnly) search.set('unreadOnly', 'true')

  const res = await fetch(
    `${supabaseUrl}/functions/v1/notifications-in-app-list?${search.toString()}`,
    { method: 'GET', headers }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string })?.message ?? res.statusText)
  }

  const json = (await res.json()) as InAppListResponse
  const data = Array.isArray(json?.data) ? json.data : []
  const count = typeof json?.count === 'number' ? json.count : data.length
  return { data, count }
}

/** POST mark notifications as read */
export async function markInAppAsRead(
  payload: { ids?: string[]; markAll?: boolean }
): Promise<{ success: boolean }> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/notifications-in-app-read`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string })?.message ?? res.statusText)
  }

  const json = (await res.json()) as { success?: boolean }
  return { success: Boolean(json?.success) }
}

/** POST clear notifications */
export async function clearInAppNotifications(
  payload: { ids?: string[]; clearAll?: boolean }
): Promise<{ success: boolean }> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/notifications-in-app-clear`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string })?.message ?? res.statusText)
  }

  const json = (await res.json()) as { success?: boolean }
  return { success: Boolean(json?.success) }
}

/** GET notification preferences */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) {
    return {
      emailMarketing: false,
      emailTransactional: true,
      pushEnabled: true,
      pushPlatforms: ['fcm', 'apns'],
      unsubscribeStatus: 'active',
    }
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/notifications-preferences`, {
    method: 'GET',
    headers,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string })?.message ?? res.statusText)
  }

  const json = (await res.json()) as NotificationPreferencesResponse
  const d = json?.data
  if (!d || typeof d !== 'object') {
    return {
      emailMarketing: false,
      emailTransactional: true,
      pushEnabled: true,
      pushPlatforms: ['fcm', 'apns'],
      unsubscribeStatus: 'active',
    }
  }

  return {
    id: typeof d.id === 'string' ? d.id : undefined,
    userId: typeof d.userId === 'string' ? d.userId : undefined,
    emailMarketing: Boolean(d.emailMarketing ?? false),
    emailTransactional: Boolean(d.emailTransactional ?? true),
    pushEnabled: Boolean(d.pushEnabled ?? true),
    pushPlatforms: Array.isArray(d.pushPlatforms) ? d.pushPlatforms : ['fcm', 'apns'],
    unsubscribeStatus: (['active', 'unsubscribed', 'bounced'].includes(String(d.unsubscribeStatus ?? 'active'))
      ? d.unsubscribeStatus
      : 'active') as NotificationPreferences['unsubscribeStatus'],
    updatedAt: typeof d.updatedAt === 'string' ? d.updatedAt : undefined,
  }
}

/** POST update notification preferences */
export async function updateNotificationPreferences(
  payload: Partial<{
    email_marketing: boolean
    email_transactional: boolean
    push_enabled: boolean
    push_platforms: string[]
    unsubscribe_status: string
  }>
): Promise<NotificationPreferences> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/notifications-preferences`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string })?.message ?? res.statusText)
  }

  const json = (await res.json()) as NotificationPreferencesResponse
  const d = json?.data
  if (!d || typeof d !== 'object') {
    return {
      emailMarketing: false,
      emailTransactional: true,
      pushEnabled: true,
      pushPlatforms: ['fcm', 'apns'],
      unsubscribeStatus: 'active',
    }
  }

  return {
    id: typeof d.id === 'string' ? d.id : undefined,
    userId: typeof d.userId === 'string' ? d.userId : undefined,
    emailMarketing: Boolean(d.emailMarketing ?? false),
    emailTransactional: Boolean(d.emailTransactional ?? true),
    pushEnabled: Boolean(d.pushEnabled ?? true),
    pushPlatforms: Array.isArray(d.pushPlatforms) ? d.pushPlatforms : ['fcm', 'apns'],
    unsubscribeStatus: (['active', 'unsubscribed', 'bounced'].includes(String(d.unsubscribeStatus ?? 'active'))
      ? d.unsubscribeStatus
      : 'active') as NotificationPreferences['unsubscribeStatus'],
    updatedAt: typeof d.updatedAt === 'string' ? d.updatedAt : undefined,
  }
}

// --- Email Templates (Admin) ---

export async function fetchEmailTemplates(): Promise<EmailTemplate[]> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) return []

  const res = await fetch(`${supabaseUrl}/functions/v1/notifications-email-templates`, {
    method: 'GET',
    headers,
  })

  if (!res.ok) return []

  const json = (await res.json()) as { data?: EmailTemplate[] }
  return Array.isArray(json?.data) ? json.data : []
}

export async function createEmailTemplate(template: {
  name: string
  subject: string
  htmlBody: string
  textBody?: string
  placeholders?: string[]
  isActive?: boolean
}): Promise<EmailTemplate | null> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) return null

  const res = await fetch(`${supabaseUrl}/functions/v1/notifications-email-templates`, {
    method: 'POST',
    headers,
    body: JSON.stringify(template),
  })

  if (!res.ok) return null

  const json = (await res.json()) as { data?: EmailTemplate }
  return json?.data ?? null
}

export async function updateEmailTemplate(
  id: string,
  template: Partial<Omit<EmailTemplate, 'id' | 'createdAt'>>
): Promise<EmailTemplate | null> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) return null

  const res = await fetch(`${supabaseUrl}/functions/v1/notifications-email-template-update`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ id, ...template }),
  })

  if (!res.ok) return null

  const json = (await res.json()) as { data?: EmailTemplate }
  return json?.data ?? null
}

export async function deleteEmailTemplate(id: string): Promise<boolean> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) return false

  const res = await fetch(`${supabaseUrl}/functions/v1/notifications-email-template-delete`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ id }),
  })

  return res.ok
}

export async function sendTestEmail(templateId: string, to: string): Promise<boolean> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) return false

  const res = await fetch(`${supabaseUrl}/functions/v1/notifications-email-send`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ templateId, to: [to], substitutions: {} }),
  })

  return res.ok
}

// --- Delivery Stats (Admin) ---

export async function fetchDeliveryStats(): Promise<DeliveryStats> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) {
    return { total: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, failed: 0 }
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/notifications-delivery-stats`, {
    method: 'GET',
    headers,
  })

  if (!res.ok) {
    return { total: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, failed: 0 }
  }

  const json = (await res.json()) as { data?: Partial<DeliveryStats> }
  const d = json?.data ?? {}
  return {
    total: typeof d.total === 'number' ? d.total : 0,
    delivered: typeof d.delivered === 'number' ? d.delivered : 0,
    opened: typeof d.opened === 'number' ? d.opened : 0,
    clicked: typeof d.clicked === 'number' ? d.clicked : 0,
    bounced: typeof d.bounced === 'number' ? d.bounced : 0,
    failed: typeof d.failed === 'number' ? d.failed : 0,
  }
}
