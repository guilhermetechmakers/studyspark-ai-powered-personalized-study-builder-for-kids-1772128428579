/**
 * Auth and onboarding type definitions.
 * All types support runtime safety with optional chaining and defaults.
 */

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
  authenticatedAt: string | null
}

export interface ChildProfile {
  id: string
  userId: string
  name: string
  age: number
  grade: string
  learningPreferences: string[]
  createdAt?: string
}

export interface ChildProfileInput {
  name: string
  age: number
  grade: string
  learningPreferences: string[]
}

export interface OnboardingSession {
  id: string
  userId: string
  step: number
  createdAt: string
}

export interface AuthResponse {
  user: User
  token?: string
  onboardingRequired?: boolean
  needsEmailVerification?: boolean
}

export interface OnboardingChildrenResponse {
  children: ChildProfile[]
}

export type LearningPreference =
  | 'playful'
  | 'exam-like'
  | 'research-based'
  | 'printable'
  | 'interactive'

export const LEARNING_PREFERENCES: { id: LearningPreference; label: string }[] = [
  { id: 'playful', label: 'Playful' },
  { id: 'exam-like', label: 'Exam-like' },
  { id: 'research-based', label: 'Research-based' },
  { id: 'printable', label: 'Printable' },
  { id: 'interactive', label: 'Interactive' },
]

export const GRADE_LEVELS = [
  'Pre-K',
  'Kindergarten',
  '1st Grade',
  '2nd Grade',
  '3rd Grade',
  '4th Grade',
  '5th Grade',
  '6th Grade',
  '7th Grade',
  '8th Grade',
  '9th Grade',
  '10th Grade',
  '11th Grade',
  '12th Grade',
]

