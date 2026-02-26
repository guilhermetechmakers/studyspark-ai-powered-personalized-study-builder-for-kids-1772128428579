/** Dashboard data models and UI state types */

export interface Child {
  id: string
  name: string
  age: number
  progress: number
  streak: number
  lastActive?: string
}

export interface Study {
  id: string
  title: string
  updatedAt: string
  status: 'saved' | 'completed' | 'in-progress'
}

export interface Recommendation {
  id: string
  topic: string
  confidence: number
  notes?: string
}

export interface UIState {
  isLoading: boolean
  isEmpty: boolean
  error?: string
}
