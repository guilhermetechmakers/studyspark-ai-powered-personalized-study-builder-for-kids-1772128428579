import { useState, useEffect, useCallback } from 'react'
import {
  fetchChildren,
  fetchStudies,
  fetchRecommendations,
  fetchOverview,
} from '@/api/dashboard'
import type { Child, Study, Recommendation, DashboardOverview } from '@/types/dashboard'

function safeArray<T>(data: unknown): T[] {
  return Array.isArray(data) ? data : []
}

export interface UseDashboardDataResult {
  overview: DashboardOverview
  children: Child[]
  studies: Study[]
  recommendations: Recommendation[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  setStudies: React.Dispatch<React.SetStateAction<Study[]>>
  setRecommendations: React.Dispatch<React.SetStateAction<Recommendation[]>>
}

export function useDashboardData(): UseDashboardDataResult {
  const [overview, setOverview] = useState<DashboardOverview>({
    childrenCount: 0,
    studiesCount: 0,
  })
  const [children, setChildren] = useState<Child[]>([])
  const [studies, setStudies] = useState<Study[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [overviewRes, childrenRes, studiesRes, recsRes] = await Promise.all([
        fetchOverview(),
        fetchChildren(),
        fetchStudies(10),
        fetchRecommendations(),
      ])
      setOverview(overviewRes)
      setChildren(safeArray<Child>(childrenRes))
      setStudies(safeArray<Study>(studiesRes))
      setRecommendations(safeArray<Recommendation>(recsRes))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to load dashboard data'
      setError(msg)
      setOverview({ childrenCount: 0, studiesCount: 0 })
      setChildren([])
      setStudies([])
      setRecommendations([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    overview,
    children,
    studies,
    recommendations,
    isLoading,
    error,
    refetch: loadData,
    setStudies,
    setRecommendations,
  }
}
