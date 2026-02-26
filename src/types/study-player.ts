/**
 * Study Player & Progress Tracking types.
 * All types support runtime-safe defaults and null-safety.
 */

export interface CreateSessionPayload {
  childId: string
  studyId: string
}

export type CreateSessionRequest = CreateSessionPayload

export interface CreateSessionResponse {
  sessionToken: string
  sessionId: string
  expiresAt: string
  activityIds?: string[]
}

export interface SubmitAttemptPayload {
  sessionToken: string
  activityId: string
  score: number
  timeSpentMs: number
  hintsUsed?: number
  responses?: Record<string, unknown>
}

export type SubmitAttemptRequest = SubmitAttemptPayload

export interface SubmitAttemptResponse {
  success: boolean
  attemptId?: string
  updatedProgress?: {
    totalScore: number
    totalTimeMs: number
    attemptCount: number
    lastAttemptAt: string
  }
}

export interface ProgressItem {
  childId: string
  studyId: string
  totalScore: number
  totalTimeMs: number
  attemptCount: number
  lastAttemptAt: string | null
}

export interface ParentAnalytics {
  totalTimeMs: number
  averageScore: number
  streakDays: number
  totalAttempts: number
  byStudy: Array<{
    studyId: string
    topic: string
    totalScore: number
    totalTimeMs: number
    attemptCount: number
  }>
  byDay: Array<{ date: string; count: number }>
}

export interface ParentAnalyticsResponse {
  children: Array<{ id: string; name: string }>
  metrics: {
    totalPoints: number
    totalTimeMinutes: number
    averageScore: number
    streak: number
    attemptCount: number
  }
  timeByDay: Array<{ date: string; count: number }>
  masteryByTopic: Array<{ topic: string; score: number }>
  byStudy: ParentAnalytics['byStudy']
  byDay: ParentAnalytics['byDay']
  streaks: Array<{ childId: string; days: number }>
}
