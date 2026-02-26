/**
 * Notifications & Email type definitions.
 * Runtime safety: use data ?? [], Array.isArray(), optional chaining.
 */

export type NotificationType =
  | 'general'
  | 'reminder'
  | 'achievement'
  | 'update'
  | 'study_completed'
  | 'subscription'

export interface InAppNotification {
  id: string
  title: string
  message: string
  data: Record<string, unknown>
  readAt: string | null
  createdAt: string
  type: NotificationType
}

export interface NotificationPreferences {
  id?: string
  userId?: string
  emailMarketing: boolean
  emailTransactional: boolean
  pushEnabled: boolean
  pushPlatforms: string[]
  unsubscribeStatus: 'active' | 'unsubscribed' | 'bounced'
  updatedAt?: string
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  emailMarketing: false,
  emailTransactional: true,
  pushEnabled: true,
  pushPlatforms: ['fcm', 'apns'],
  unsubscribeStatus: 'active',
}

export interface InAppListResponse {
  data: InAppNotification[]
  count: number
}

export interface NotificationPreferencesResponse {
  data: NotificationPreferences
}
