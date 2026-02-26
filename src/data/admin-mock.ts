/**
 * Mock data for Admin Dashboard.
 * Used when API endpoints are not available.
 */

import type {
  AdminUser,
  ContentItem,
  Plan,
  Coupon,
  AnalyticsKpis,
  AnalyticsDataPoint,
  SystemLog,
  SystemHealthSummary,
  AdminAuditLog,
  ContentReviewItem,
  ModerationQueueItem,
  AdminRole,
  AdminPermission,
} from '@/types/admin'

export const mockUsers: AdminUser[] = [
  {
    id: 'u1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'parent',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    lastActive: '2025-02-25T14:30:00Z',
  },
  {
    id: 'u2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2024-02-20T09:00:00Z',
    lastActive: '2025-02-24T18:00:00Z',
  },
  {
    id: 'u3',
    name: 'Carol Williams',
    email: 'carol@example.com',
    role: 'parent',
    status: 'suspended',
    createdAt: '2024-03-10T11:00:00Z',
    lastActive: '2025-02-20T12:00:00Z',
  },
  {
    id: 'u4',
    name: 'David Brown',
    email: 'david@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-05T08:00:00Z',
    lastActive: '2025-02-26T09:00:00Z',
  },
  {
    id: 'u5',
    name: 'Eva Davis',
    email: 'eva@example.com',
    role: 'parent',
    status: 'active',
    createdAt: '2024-04-01T14:00:00Z',
    lastActive: '2025-02-25T16:45:00Z',
  },
]

export const mockContentItems: ContentItem[] = [
  {
    id: 'c1',
    type: 'study',
    title: 'Math Basics - Fractions',
    flaggedBy: 'u2',
    flagReason: 'Inappropriate content',
    severity: 'medium',
    status: 'pending',
    createdAt: '2025-02-24T10:00:00Z',
    authorId: 'u1',
  },
  {
    id: 'c2',
    type: 'material',
    title: 'Science Worksheet',
    flaggedBy: 'u3',
    flagReason: 'Copyright concern',
    severity: 'high',
    status: 'pending',
    createdAt: '2025-02-23T15:30:00Z',
    authorId: 'u2',
  },
  {
    id: 'c3',
    type: 'comment',
    title: 'User comment on study',
    flaggedBy: 'u1',
    flagReason: 'Spam',
    severity: 'low',
    status: 'approved',
    createdAt: '2025-02-22T09:00:00Z',
    authorId: 'u5',
  },
]

export const mockPlans: Plan[] = [
  {
    id: 'p1',
    name: 'Free',
    price: 0,
    currency: 'USD',
    cadence: 'monthly',
    features: ['3 studies per month', 'Basic flashcards'],
    quotas: { studies: 3 },
    active: true,
  },
  {
    id: 'p2',
    name: 'Pro',
    price: 9.99,
    currency: 'USD',
    cadence: 'monthly',
    features: ['Unlimited studies', 'AI generation', 'Export'],
    quotas: { studies: -1 },
    active: true,
    trialDays: 14,
  },
  {
    id: 'p3',
    name: 'Family',
    price: 19.99,
    currency: 'USD',
    cadence: 'monthly',
    features: ['Up to 5 children', 'All Pro features', 'Priority support'],
    quotas: { studies: -1, children: 5 },
    active: true,
  },
]

export const mockCoupons: Coupon[] = [
  {
    id: 'cp1',
    code: 'WELCOME20',
    discountType: 'percent',
    value: 20,
    validFrom: '2025-01-01T00:00:00Z',
    validTo: '2025-12-31T23:59:59Z',
    usageLimit: 1000,
    usedCount: 42,
  },
  {
    id: 'cp2',
    code: 'FIRSTMONTH',
    discountType: 'amount',
    value: 5,
    validFrom: '2025-02-01T00:00:00Z',
    validTo: '2025-02-28T23:59:59Z',
    usageLimit: 500,
    usedCount: 128,
  },
]

export const mockKpis: AnalyticsKpis = {
  mau: 12450,
  mrr: 45230,
  churn: 2.3,
  newSignups: 342,
  activeSubscriptions: 3892,
  creationVolume: 1250,
}

export const mockTimeSeries: AnalyticsDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (29 - i))
  return {
    time: d.toISOString().slice(0, 10),
    mau: 10000 + Math.floor(Math.random() * 3000),
    mrr: 40000 + Math.floor(Math.random() * 10000),
    churn: 1.5 + Math.random() * 2,
    newSignups: 200 + Math.floor(Math.random() * 200),
    activeSubscriptions: 3500 + Math.floor(Math.random() * 500),
  }
})

export const mockLogs: SystemLog[] = [
  {
    id: 'l1',
    timestamp: '2025-02-26T09:15:00Z',
    level: 'info',
    component: 'auth',
    message: 'User login successful',
    correlationId: 'corr-001',
  },
  {
    id: 'l2',
    timestamp: '2025-02-26T09:14:32Z',
    level: 'warn',
    component: 'ai-api',
    message: 'Rate limit approaching (85%)',
    correlationId: 'corr-002',
  },
  {
    id: 'l3',
    timestamp: '2025-02-26T09:12:00Z',
    level: 'error',
    component: 'payment',
    message: 'Stripe webhook validation failed',
    correlationId: 'corr-003',
  },
  {
    id: 'l4',
    timestamp: '2025-02-26T09:10:00Z',
    level: 'debug',
    component: 'study-gen',
    message: 'Study generation completed',
    correlationId: 'corr-004',
  },
]

export const mockHealthSummary: SystemHealthSummary = {
  queueBacklog: 12,
  aiApiUsage: 78,
  errorCount: 3,
  lastUpdated: new Date().toISOString(),
}

export const mockAuditLogs: AdminAuditLog[] = [
  {
    id: 'al1',
    adminId: 'u4',
    adminEmail: 'david@example.com',
    action: 'user_suspended',
    targetId: 'u3',
    targetType: 'user',
    payload: { reason: 'Terms violation' },
    createdAt: '2025-02-26T10:00:00Z',
  },
  {
    id: 'al2',
    adminId: 'u4',
    adminEmail: 'david@example.com',
    action: 'content_approved',
    targetId: 'c3',
    targetType: 'content',
    payload: {},
    createdAt: '2025-02-26T09:45:00Z',
  },
  {
    id: 'al3',
    adminId: 'u4',
    adminEmail: 'david@example.com',
    action: 'export_report',
    targetType: 'report',
    payload: { type: 'moderation' },
    createdAt: '2025-02-26T09:30:00Z',
  },
]

export const mockContentReviewItems: ContentReviewItem[] = [
  {
    id: 'cr1',
    contentId: 'c1',
    contentType: 'study',
    title: 'Math Basics - Fractions',
    submittedBy: 'u1',
    submittedByName: 'Alice Johnson',
    status: 'pending',
    createdAt: '2025-02-24T10:00:00Z',
    updatedAt: '2025-02-24T10:00:00Z',
    version: 1,
  },
  {
    id: 'cr2',
    contentId: 'c2',
    contentType: 'material',
    title: 'Science Worksheet',
    submittedBy: 'u2',
    submittedByName: 'Bob Smith',
    status: 'changes_requested',
    assignedTo: 'u4',
    assignedToName: 'David Brown',
    metadata: { note: 'Please add attribution' },
    createdAt: '2025-02-23T15:30:00Z',
    updatedAt: '2025-02-25T11:00:00Z',
    version: 2,
  },
]

export const mockModerationQueueItems: ModerationQueueItem[] = [
  {
    id: 'mq1',
    userId: 'u3',
    userEmail: 'carol@example.com',
    userName: 'Carol Williams',
    reason: 'Repeated policy violations',
    status: 'pending',
    createdAt: '2025-02-25T14:00:00Z',
    updatedAt: '2025-02-25T14:00:00Z',
  },
]

export const mockAdminRoles: AdminRole[] = [
  { id: 'r1', name: 'Super Admin', permissions: ['admin:*'], description: 'Full access' },
  { id: 'r2', name: 'Moderator', permissions: ['admin:moderation', 'admin:content-review'], description: 'Moderation only' },
  { id: 'r3', name: 'Analyst', permissions: ['admin:analytics', 'admin:audit'], description: 'Analytics and audit' },
]

export const mockAdminPermissions: AdminPermission[] = [
  { id: 'p1', name: 'admin:*', description: 'All admin permissions', category: 'General' },
  { id: 'p2', name: 'admin:moderation', description: 'User moderation', category: 'Moderation' },
  { id: 'p3', name: 'admin:content-review', description: 'Content review', category: 'Content' },
  { id: 'p4', name: 'admin:analytics', description: 'Analytics dashboards', category: 'Analytics' },
  { id: 'p5', name: 'admin:audit', description: 'Audit logs', category: 'Audit' },
  { id: 'p6', name: 'admin:settings', description: 'Admin settings', category: 'Settings' },
]
