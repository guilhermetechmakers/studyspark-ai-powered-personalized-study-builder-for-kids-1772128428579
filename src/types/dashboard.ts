/**
 * Dashboard data types for parent dashboard.
 * All arrays must be guarded with data ?? [] and Array.isArray()
 */

export interface Child {
  id: string
  name: string
  age: number
  progress: number
  streak: number
  lastActive?: string
}

export type StudyStatus = 'saved' | 'completed' | 'in-progress'

export interface Study {
  id: string
  title: string
  updatedAt: string
  status: StudyStatus
}

export interface Recommendation {
  id: string
  topic: string
  confidence: number
  notes?: string
}

export interface DashboardUIState {
  isLoading: boolean
  isLoadingChildren: boolean
  isLoadingStudies: boolean
  isLoadingRecommendations: boolean
  hasError: boolean
  errorMessage?: string
}

export interface DashboardData {
  children?: Child[]
  studies?: Study[]
  recommendations?: Recommendation[]
}
