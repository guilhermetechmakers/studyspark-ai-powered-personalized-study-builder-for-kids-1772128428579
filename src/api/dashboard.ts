import { apiGet } from '@/lib/api'
import type { Child, Study, Recommendation } from '@/types/dashboard'

interface ChildrenResponse {
  data?: Child[]
}

interface StudiesResponse {
  data?: Study[]
}

interface RecommendationsResponse {
  data?: Recommendation[]
}

export async function fetchChildren(): Promise<Child[]> {
  try {
    const res = await apiGet<ChildrenResponse>('/api/dashboard/children')
    return Array.isArray(res?.data) ? res.data : []
  } catch {
    return []
  }
}

export async function fetchStudies(limit = 10): Promise<Study[]> {
  try {
    const res = await apiGet<StudiesResponse>(`/api/dashboard/studies?limit=${limit}`)
    return Array.isArray(res?.data) ? res.data : []
  } catch {
    return []
  }
}

export async function fetchRecommendations(): Promise<Recommendation[]> {
  try {
    const res = await apiGet<RecommendationsResponse>('/api/dashboard/recommendations')
    return Array.isArray(res?.data) ? res.data : []
  } catch {
    return []
  }
}
