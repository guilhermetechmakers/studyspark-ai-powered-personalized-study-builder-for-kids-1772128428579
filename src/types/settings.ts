/**
 * Settings & Preferences type definitions.
 * All types support runtime safety with optional chaining and defaults.
 */

import type { LearningStyle } from '@/types/study-wizard'

export interface ParentAccount {
  id: string
  name: string
  email: string
  avatarUrl?: string
  profileCompletion: number
}

/** @deprecated Use ChildProfile from @/types/profile */
export interface ChildProfile {
  id: string
  parentId?: string
  userId?: string
  name: string
  age: number
  grade: string
  learningStyle?: LearningStyle
  learningPreferences?: string[]
  avatarUrl?: string
  preferences?: Record<string, unknown>
}

/** Normalized child profile for settings (supports both legacy and new format) */
export type ChildProfileFormData = ChildProfile & {
  learningPreferences: string[]
}

export interface NotificationChannel {
  enabled: boolean
  categories: {
    studyCompleted?: boolean
    reminders?: boolean
    subscriptionUpdates?: boolean
    weeklyDigest?: boolean
  }
}

export interface NotificationSettings {
  id?: string
  parentId?: string
  email: NotificationChannel
  push: NotificationChannel
  inApp: NotificationChannel
}

export interface Integration {
  id: string
  parentId?: string
  provider: 'google_drive' | 'dropbox' | 'classroom'
  connected: boolean
  lastSync?: string
  metadata?: Record<string, unknown>
}

export interface BillingInfo {
  id?: string
  parentId?: string
  planId: string
  planName: string
  price: number
  currency: string
  nextBillingDate?: string
  usage?: { studies: number; limit: number }
}

export interface Invoice {
  id: string
  billingPeriodStart: string
  billingPeriodEnd: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed'
  pdfUrl?: string
}

export interface PrivacySettings {
  id?: string
  parentId?: string
  dataExportConsent?: boolean
  deletionConsent?: boolean
  dataRetention?: string
  dataSharing?: Record<string, boolean>
  consents?: Record<string, boolean>
}

export interface DataExportRequest {
  id: string
  status: 'pending' | 'processing' | 'ready' | 'expired'
  requestedAt: string
  expectedReadyAt?: string
}

export const LEARNING_STYLE_OPTIONS: { value: LearningStyle; label: string }[] = [
  { value: 'playful', label: 'Playful' },
  { value: 'exam-like', label: 'Exam-like' },
  { value: 'research-based', label: 'Research-based' },
  { value: 'printable', label: 'Printable' },
  { value: 'interactive', label: 'Interactive' },
]

export const INTEGRATION_PROVIDERS = [
  { id: 'google_drive' as const, name: 'Google Drive', icon: 'drive' },
  { id: 'dropbox' as const, name: 'Dropbox', icon: 'dropbox' },
  { id: 'classroom' as const, name: 'Google Classroom', icon: 'classroom' },
] as const

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  email: {
    enabled: false,
    categories: {
      studyCompleted: true,
      reminders: true,
      subscriptionUpdates: true,
      weeklyDigest: false,
    },
  },
  push: {
    enabled: false,
    categories: {
      studyCompleted: true,
      reminders: true,
      subscriptionUpdates: true,
      weeklyDigest: false,
    },
  },
  inApp: {
    enabled: true,
    categories: {
      studyCompleted: true,
      reminders: true,
      subscriptionUpdates: true,
      weeklyDigest: false,
    },
  },
}

export const DEFAULT_BILLING_INFO: BillingInfo = {
  planId: 'free',
  planName: 'Free',
  price: 0,
  currency: 'USD',
  usage: { studies: 0, limit: 3 },
}

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  dataExportConsent: false,
  deletionConsent: false,
  consents: {
    analytics: true,
    marketing: false,
    personalization: true,
  },
}
