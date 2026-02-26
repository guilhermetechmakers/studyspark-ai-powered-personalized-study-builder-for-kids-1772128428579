/**
 * Dashboard API - fetches children, studies, and recommendations.
 * Returns [] for empty results; all responses are validated.
 */

import { apiGet } from '@/lib/api'
import { asArray } from '@/lib/data-guard'
import type { Child, Study, Recommendation } from '@/types/dashboard'

export interface DashboardChildrenResponse {
  data?: Child[]
}

export interface DashboardStudiesResponse {
  data?: Study[]
}

export interface DashboardRecommendationsResponse {
  data?: Recommendation[]
}

export async function fetchChildren(): Promise<Child[]> {
  try {
    const response = await apiGet<DashboardChildrenResponse>('/api/dashboard/children')
    return asArray<Child>(response?.data)
  } catch {
    return []
  }
}

export async function fetchStudies(limit = 10): Promise<Study[]> {
  try {
    const response = await apiGet<DashboardStudiesResponse>(
      `/api/dashboard/studies?limit=${limit}`
    )
    return asArray<Study>(response?.data)
  } catch {
    return []
  }
}

export async function fetchRecommendations(): Promise<Recommendation[]> {
  try {
    const response = await apiGet<DashboardRecommendationsResponse>(
      '/api/dashboard/recommendations'
    )
    return asArray<Recommendation>(response?.data)
  } catch {
    return []
  }
}
