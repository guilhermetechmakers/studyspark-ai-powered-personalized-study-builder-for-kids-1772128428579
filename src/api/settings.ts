/**
 * Settings API - fetches and updates parent, child, notifications,
 * integrations, billing, and privacy data.
 * Uses Supabase for profile/child when authenticated; else native fetch via lib/api.ts.
 */

import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  type ApiError,
} from '@/lib/api'
import { supabase } from '@/lib/supabase'
import {
  fetchUserProfile,
  updateUserProfile,
  fetchChildProfiles as fetchChildProfilesFromProfile,
  createChildProfile as createChildProfileFromProfile,
  updateChildProfile as updateChildProfileFromProfile,
  deleteChildProfile as deleteChildProfileFromProfile,
} from '@/api/profile'
import { asArray } from '@/lib/data-guard'
import type {
  ParentAccount,
  ChildProfile,
  NotificationSettings,
  Integration,
  BillingInfo,
  Invoice,
  PrivacySettings,
  DataExportRequest,
} from '@/types/settings'
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_BILLING_INFO,
  DEFAULT_PRIVACY_SETTINGS,
} from '@/types/settings'

function safeParent(data: unknown): ParentAccount | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>
  if (typeof d.id !== 'string' || typeof d.name !== 'string' || typeof d.email !== 'string') {
    return null
  }
  return {
    id: d.id as string,
    name: d.name as string,
    email: d.email as string,
    avatarUrl: typeof d.avatarUrl === 'string' ? d.avatarUrl : undefined,
    profileCompletion: typeof d.profileCompletion === 'number' ? d.profileCompletion : 0,
  }
}

function safeChild(item: unknown): ChildProfile | null {
  if (!item || typeof item !== 'object') return null
  const d = item as Record<string, unknown>
  if (typeof d.id !== 'string' || typeof d.name !== 'string' || typeof d.age !== 'number') {
    return null
  }
  return {
    id: d.id as string,
    parentId: typeof d.parentId === 'string' ? d.parentId : undefined,
    name: d.name as string,
    age: d.age as number,
    grade: typeof d.grade === 'string' ? d.grade : '',
    learningStyle: (['playful', 'exam-like', 'research-based', 'printable', 'interactive'].includes(
      String(d.learningStyle ?? '')
    )
      ? d.learningStyle
      : 'playful') as ChildProfile['learningStyle'],
    avatarUrl: typeof d.avatarUrl === 'string' ? d.avatarUrl : undefined,
    preferences: typeof d.preferences === 'object' && d.preferences ? (d.preferences as Record<string, unknown>) : undefined,
  }
}

function safeNotificationSettings(data: unknown): NotificationSettings {
  if (!data || typeof data !== 'object') return DEFAULT_NOTIFICATION_SETTINGS
  const d = data as Record<string, unknown>
  const channel = (key: string) => {
    const c = d[key]
    if (!c || typeof c !== 'object') return { enabled: false, categories: {} }
    const ch = c as Record<string, unknown>
    const cat = ch.categories
    const categories =
      cat && typeof cat === 'object'
        ? {
            studyCompleted: Boolean((cat as Record<string, unknown>).studyCompleted),
            reminders: Boolean((cat as Record<string, unknown>).reminders),
            subscriptionUpdates: Boolean((cat as Record<string, unknown>).subscriptionUpdates),
            weeklyDigest: Boolean((cat as Record<string, unknown>).weeklyDigest),
          }
        : {}
    return {
      enabled: Boolean(ch.enabled),
      categories,
    }
  }
  return {
    id: typeof d.id === 'string' ? d.id : undefined,
    parentId: typeof d.parentId === 'string' ? d.parentId : undefined,
    email: channel('email'),
    push: channel('push'),
    inApp: channel('inApp'),
  }
}

function safeIntegration(item: unknown): Integration | null {
  if (!item || typeof item !== 'object') return null
  const d = item as Record<string, unknown>
  if (typeof d.id !== 'string' || typeof d.provider !== 'string') return null
  const provider = d.provider as Integration['provider']
  if (!['google_drive', 'dropbox', 'classroom'].includes(provider)) return null
  return {
    id: d.id as string,
    parentId: typeof d.parentId === 'string' ? d.parentId : undefined,
    provider,
    connected: Boolean(d.connected),
    lastSync: typeof d.lastSync === 'string' ? d.lastSync : undefined,
    metadata: typeof d.metadata === 'object' && d.metadata ? (d.metadata as Record<string, unknown>) : undefined,
  }
}

function safeBillingInfo(data: unknown): BillingInfo {
  if (!data || typeof data !== 'object') return DEFAULT_BILLING_INFO
  const d = data as Record<string, unknown>
  const usage = d.usage
  const usageObj =
    usage && typeof usage === 'object' && 'studies' in usage && 'limit' in usage
      ? { studies: Number((usage as Record<string, unknown>).studies), limit: Number((usage as Record<string, unknown>).limit) }
      : DEFAULT_BILLING_INFO.usage
  return {
    id: typeof d.id === 'string' ? d.id : undefined,
    parentId: typeof d.parentId === 'string' ? d.parentId : undefined,
    planId: typeof d.planId === 'string' ? d.planId : 'free',
    planName: typeof d.planName === 'string' ? d.planName : 'Free',
    price: typeof d.price === 'number' ? d.price : 0,
    currency: typeof d.currency === 'string' ? d.currency : 'USD',
    nextBillingDate: typeof d.nextBillingDate === 'string' ? d.nextBillingDate : undefined,
    usage: usageObj,
  }
}

function safeInvoice(item: unknown): Invoice | null {
  if (!item || typeof item !== 'object') return null
  const d = item as Record<string, unknown>
  if (typeof d.id !== 'string') return null
  return {
    id: d.id as string,
    billingPeriodStart: typeof d.billingPeriodStart === 'string' ? d.billingPeriodStart : '',
    billingPeriodEnd: typeof d.billingPeriodEnd === 'string' ? d.billingPeriodEnd : '',
    amount: typeof d.amount === 'number' ? d.amount : 0,
    currency: typeof d.currency === 'string' ? d.currency : 'USD',
    status: ['paid', 'pending', 'failed'].includes(String(d.status ?? ''))
      ? (d.status as Invoice['status'])
      : 'pending',
    pdfUrl: typeof d.pdfUrl === 'string' ? d.pdfUrl : undefined,
  }
}

function safePrivacySettings(data: unknown): PrivacySettings {
  if (!data || typeof data !== 'object') return DEFAULT_PRIVACY_SETTINGS
  const d = data as Record<string, unknown>
  const consents = d.consents
  const consentsObj =
    consents && typeof consents === 'object'
      ? (consents as Record<string, boolean>)
      : DEFAULT_PRIVACY_SETTINGS.consents ?? {}
  return {
    id: typeof d.id === 'string' ? d.id : undefined,
    parentId: typeof d.parentId === 'string' ? d.parentId : undefined,
    dataExportConsent: Boolean(d.dataExportConsent),
    deletionConsent: Boolean(d.deletionConsent),
    dataRetention: typeof d.dataRetention === 'string' ? d.dataRetention : undefined,
    dataSharing:
      d.dataSharing && typeof d.dataSharing === 'object' ? (d.dataSharing as Record<string, boolean>) : undefined,
    consents: consentsObj,
  }
}

async function getCurrentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}

export async function fetchParent(): Promise<ParentAccount | null> {
  const userId = await getCurrentUserId()
  if (userId) {
    const profile = await fetchUserProfile()
    if (profile) {
      return { id: profile.id, name: profile.name, email: profile.email, profileCompletion: 75 }
    }
  }
  try {
    const data = await apiGet<unknown>('/api/settings/parent')
    return safeParent(data)
  } catch {
    return null
  }
}

export async function updateParent(payload: { name?: string; email?: string }): Promise<ParentAccount | null> {
  const userId = await getCurrentUserId()
  if (userId) {
    const updated = await updateUserProfile(payload)
    if (updated) {
      return { id: updated.id, name: updated.name, email: updated.email, profileCompletion: 75 }
    }
  }
  try {
    const data = await apiPut<unknown>('/api/settings/parent', payload)
    return safeParent(data)
  } catch {
    return null
  }
}

export async function fetchChildProfiles(): Promise<ChildProfile[]> {
  const userId = await getCurrentUserId()
  if (userId) {
    const children = await fetchChildProfilesFromProfile()
    return (children ?? []).map((c) => ({
      id: c.id,
      parentId: c.userId,
      name: c.name,
      age: c.age,
      grade: c.grade,
      learningStyle: (c.learningPreferences?.[0] ?? 'playful') as ChildProfile['learningStyle'],
    }))
  }
  try {
    const res = await apiGet<unknown>('/api/settings/child')
    const list = Array.isArray(res) ? res : Array.isArray((res as Record<string, unknown>)?.profiles)
      ? (res as Record<string, unknown>).profiles
      : []
    return asArray(list)
      .map((item) => safeChild(item))
      .filter((c): c is ChildProfile => c !== null)
  } catch {
    return []
  }
}

function toProfileChildPayload(payload: {
  name: string
  age: number
  grade: string
  learningStyle?: string
  learningPreferences?: string[]
}): { name: string; age: number; grade: string; learningPreferences: string[] } {
  const valid = ['Playful', 'Exam-like', 'Research-based', 'Printable', 'Interactive']
  const prefs = Array.isArray(payload.learningPreferences) && payload.learningPreferences.length > 0
    ? payload.learningPreferences.filter((p) => valid.includes(p))
    : []
  if (prefs.length > 0) {
    return {
      name: payload.name,
      age: Math.min(18, Math.max(4, payload.age)),
      grade: payload.grade || 'K',
      learningPreferences: prefs,
    }
  }
  const style = payload.learningStyle ?? 'playful'
  const mapped =
    style === 'playful'
      ? 'Playful'
      : style === 'exam-like'
        ? 'Exam-like'
        : style === 'research-based'
          ? 'Research-based'
          : style === 'printable'
            ? 'Printable'
            : style === 'interactive'
              ? 'Interactive'
              : 'Playful'
  return {
    name: payload.name,
    age: Math.min(18, Math.max(4, payload.age)),
    grade: payload.grade || 'K',
    learningPreferences: valid.includes(mapped) ? [mapped] : ['Playful'],
  }
}

export async function createChildProfile(payload: Omit<ChildProfile, 'id' | 'parentId'>): Promise<ChildProfile | null> {
  const userId = await getCurrentUserId()
  if (userId) {
    const profilePayload = toProfileChildPayload(payload)
    const created = await createChildProfileFromProfile(profilePayload)
    if (created) {
      return {
        id: created.id,
        parentId: created.userId,
        name: created.name,
        age: created.age,
        grade: created.grade,
        learningStyle: (created.learningPreferences?.[0] ?? 'playful') as ChildProfile['learningStyle'],
      }
    }
  }
  try {
    const data = await apiPost<unknown>('/api/settings/child', payload)
    return safeChild(data)
  } catch {
    return null
  }
}

export async function updateChildProfile(
  id: string,
  payload: Partial<Omit<ChildProfile, 'id' | 'parentId'>>
): Promise<ChildProfile | null> {
  const userId = await getCurrentUserId()
  if (userId) {
    const profilePayload = toProfileChildPayload(payload as Parameters<typeof toProfileChildPayload>[0])
    const updatePayload: Partial<{ name: string; age: number; grade: string; learningPreferences: string[] }> = {}
    if (payload.name !== undefined) updatePayload.name = payload.name
    if (payload.age !== undefined) updatePayload.age = payload.age
    if (payload.grade !== undefined) updatePayload.grade = payload.grade
    if (profilePayload.learningPreferences?.length)
      updatePayload.learningPreferences = profilePayload.learningPreferences
    const updated = await updateChildProfileFromProfile(id, updatePayload)
    if (updated) {
      return {
        id: updated.id,
        parentId: updated.userId,
        name: updated.name,
        age: updated.age,
        grade: updated.grade,
        learningStyle: (updated.learningPreferences?.[0] ?? 'playful') as ChildProfile['learningStyle'],
      }
    }
  }
  try {
    const data = await apiPut<unknown>(`/api/settings/child/${id}`, payload)
    return safeChild(data)
  } catch {
    return null
  }
}

export async function deleteChildProfile(id: string): Promise<boolean> {
  const userId = await getCurrentUserId()
  if (userId) {
    const ok = await deleteChildProfileFromProfile(id)
    if (ok) return true
  }
  try {
    await apiDelete(`/api/settings/child/${id}`)
    return true
  } catch {
    return false
  }
}

export async function fetchNotificationSettings(): Promise<NotificationSettings> {
  try {
    const data = await apiGet<unknown>('/api/settings/notifications')
    return safeNotificationSettings(data)
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS
  }
}

export async function updateNotificationSettings(
  payload: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  try {
    const data = await apiPut<unknown>('/api/settings/notifications', payload)
    return safeNotificationSettings(data)
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS
  }
}

export async function fetchIntegrations(): Promise<Integration[]> {
  try {
    const res = await apiGet<unknown>('/api/settings/integrations')
    const list = Array.isArray(res) ? res : Array.isArray((res as Record<string, unknown>)?.integrations)
      ? (res as Record<string, unknown>).integrations
      : []
    return asArray(list)
      .map((item) => safeIntegration(item))
      .filter((i): i is Integration => i !== null)
  } catch {
    return []
  }
}

export async function connectIntegration(provider: Integration['provider']): Promise<Integration | null> {
  try {
    const data = await apiPost<unknown>(`/api/settings/integrations/${provider}`)
    return safeIntegration(data)
  } catch {
    return null
  }
}

export async function disconnectIntegration(provider: Integration['provider']): Promise<boolean> {
  try {
    await apiDelete(`/api/settings/integrations/${provider}`)
    return true
  } catch {
    return false
  }
}

export async function fetchBillingInfo(): Promise<BillingInfo> {
  try {
    const data = await apiGet<unknown>('/api/billing')
    return safeBillingInfo(data)
  } catch {
    return DEFAULT_BILLING_INFO
  }
}

export async function fetchInvoices(): Promise<Invoice[]> {
  try {
    const res = await apiGet<unknown>('/api/billing/invoices')
    const list = Array.isArray(res) ? res : Array.isArray((res as Record<string, unknown>)?.invoices)
      ? (res as Record<string, unknown>).invoices
      : []
    return asArray(list)
      .map((item) => safeInvoice(item))
      .filter((i): i is Invoice => i !== null)
  } catch {
    return []
  }
}

export async function changePlan(planId: string): Promise<BillingInfo | null> {
  try {
    const data = await apiPost<unknown>('/api/billing/change-plan', { planId })
    return safeBillingInfo(data)
  } catch {
    return null
  }
}

export async function cancelSubscription(): Promise<boolean> {
  try {
    await apiPost('/api/billing/cancel')
    return true
  } catch {
    return false
  }
}

export async function fetchDataExportRequests(): Promise<DataExportRequest[]> {
  try {
    const res = await apiGet<unknown>('/api/privacy/exports')
    const list = Array.isArray(res) ? res : Array.isArray((res as Record<string, unknown>)?.exports)
      ? (res as Record<string, unknown>).exports
      : []
    return asArray(list).filter((item): item is DataExportRequest => {
      if (!item || typeof item !== 'object') return false
      const d = item as Record<string, unknown>
      return typeof d.id === 'string' && typeof d.status === 'string' && typeof d.requestedAt === 'string'
    }) as DataExportRequest[]
  } catch {
    return []
  }
}

export async function requestDataExport(): Promise<DataExportRequest | null> {
  try {
    const data = await apiPost<unknown>('/api/privacy/export')
    if (!data || typeof data !== 'object') return null
    const d = data as Record<string, unknown>
    const status = ['pending', 'processing', 'ready', 'expired'].includes(String(d.status ?? ''))
      ? (d.status as DataExportRequest['status'])
      : 'pending'
    return {
      id: String(d.id ?? ''),
      status,
      requestedAt: String(d.requestedAt ?? new Date().toISOString()),
      expectedReadyAt: typeof d.expectedReadyAt === 'string' ? d.expectedReadyAt : undefined,
    }
  } catch {
    return null
  }
}

export async function requestDataDeletion(): Promise<boolean> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
  if (supabaseUrl) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) return false
      const res = await fetch(`${supabaseUrl}/functions/v1/privacy-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      const data = (await res.json().catch(() => ({}))) as { success?: boolean }
      return Boolean(data?.success)
    } catch {
      return false
    }
  }
  try {
    await apiPost('/api/privacy/delete')
    return true
  } catch {
    return false
  }
}

export async function fetchPrivacyConsents(): Promise<PrivacySettings> {
  try {
    const data = await apiGet<unknown>('/api/privacy/consents')
    return safePrivacySettings(data)
  } catch {
    return DEFAULT_PRIVACY_SETTINGS
  }
}

export async function updatePrivacyConsents(payload: Partial<PrivacySettings>): Promise<PrivacySettings> {
  try {
    const data = await apiPut<unknown>('/api/privacy/consents', payload)
    return safePrivacySettings(data)
  } catch {
    return DEFAULT_PRIVACY_SETTINGS
  }
}

export type { ApiError }
