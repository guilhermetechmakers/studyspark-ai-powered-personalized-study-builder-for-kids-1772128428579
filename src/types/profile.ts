/**
 * User Profile & Child Profile type definitions.
 * Aligned with spec: grade enum K,1-12; learningPreferences array; age 4-18.
 */

/** Grade levels per spec */
export const GRADE_OPTIONS = [
  'K',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
] as const

export type Grade = (typeof GRADE_OPTIONS)[number]

/** Valid grade values for validation */
export const VALID_GRADES: readonly string[] = [...GRADE_OPTIONS]

/** Grade levels with labels for display */
export const GRADE_LEVELS = GRADE_OPTIONS.map((value) => ({
  value,
  label: value === 'K' ? 'Kindergarten' : `Grade ${value}`,
}))

/** Learning preferences per spec */
export const LEARNING_PREFERENCE_OPTIONS = [
  { value: 'Playful', label: 'Playful' },
  { value: 'Exam-like', label: 'Exam-like' },
  { value: 'Research-based', label: 'Research-based' },
  { value: 'Printable', label: 'Printable' },
  { value: 'Interactive', label: 'Interactive in-app' },
] as const

export type LearningPreference = (typeof LEARNING_PREFERENCE_OPTIONS)[number]['value']

/** Valid learning preference values for validation */
export const VALID_LEARNING_PREFERENCES: readonly string[] = LEARNING_PREFERENCE_OPTIONS.map(
  (o) => o.value
)

export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  createdAt: string
  updatedAt: string
}

export interface ChildProfile {
  id: string
  userId: string
  name: string
  age: number
  grade: string
  learningPreferences: string[]
  createdAt?: string
  updatedAt?: string
}

/** Alias for API layer compatibility */
export type ChildProfileData = ChildProfile

export interface ChildProfileInput {
  name: string
  age: number
  grade: string
  learningPreferences: string[]
}

export interface ProfileAuditLog {
  id: string
  userId: string
  action: string
  targetId?: string
  targetType: 'user' | 'child'
  changedBy?: string
  changes?: Record<string, unknown>
  createdAt: string
}

/** Alias for API layer compatibility */
export type ProfileAuditLogEntry = ProfileAuditLog
