export type UserStatus = 'active' | 'suspended' | 'deleted'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  status: UserStatus
  createdAt: string
  lastActive?: string
  avatarUrl?: string
  metadata?: Record<string, unknown>
}

export type ContentType = 'study' | 'material' | 'comment'
export type ModerationStatus = 'pending' | 'reviewed' | 'approved' | 'banned'

export interface ContentItem {
  id: string
  type: ContentType
  title: string
  flaggedBy: string
  flagReason: string
  severity?: 'low' | 'medium' | 'high'
  status: ModerationStatus
  createdAt: string
  authorId?: string
  moderatorNotes?: string
}

export type PlanCadence = 'monthly' | 'yearly'

export interface Plan {
  id: string
  name: string
  price: number
  currency: string
  cadence: PlanCadence
  features: string[]
  quotas?: Record<string, number>
  trialDays?: number
  active: boolean
}

export type DiscountType = 'percent' | 'amount'

export interface Coupon {
  id: string
  code: string
  discountType: DiscountType
  value: number
  validFrom: string
  validTo: string
  usageLimit?: number
  usedCount?: number
}

export interface AnalyticsKpis {
  mau: number
  mrr: number
  churn: number
  newSignups: number
  activeSubscriptions: number
  creationVolume: number
}

export interface AnalyticsDataPoint {
  time: string
  mau: number
  mrr: number
  churn: number
  newSignups: number
  activeSubscriptions: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page?: number
  limit?: number
}

/** @deprecated Use AnalyticsDataPoint */
export type AnalyticsTimePoint = AnalyticsDataPoint

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export interface SystemLog {
  id: string
  timestamp: string
  level: LogLevel
  component: string
  message: string
  correlationId?: string
}

export interface SystemHealthSummary {
  queueBacklog: number
  aiApiUsage: number
  errorCount: number
  errorCount24h?: number
  lastUpdated?: string
  status?: string
}
