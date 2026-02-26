import { useState, useEffect, useCallback } from 'react'
import {
  fetchChildren,
  fetchStudies,
  fetchRecommendations,
} from '@/api/dashboard'
import {
  mockChildren,
  mockStudies,
  mockRecommendations,
} from '@/data/dashboard-mock'
import { asArray, dataGuard } from '@/lib/data-guard'
import type { Child, Study, Recommendation } from '@/types/dashboard'

const USE_MOCK = !import.meta.env.VITE_API_URL

export function useDashboardData() {
  const [children, setChildren] = useState<Child[]>([])
  const [studies, setStudies] = useState<Study[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setHasError(false)

    try {
      if (USE_MOCK) {
        setChildren(asArray(mockChildren))
        setStudies(asArray(mockStudies))
        setRecommendations(asArray(mockRecommendations))
      } else {
        const [childrenData, studiesData, recsData] = await Promise.all([
          fetchChildren(),
          fetchStudies(10),
          fetchRecommendations(),
        ])
        setChildren(asArray(childrenData))
        setStudies(asArray(studiesData))
        setRecommendations(asArray(recsData))
      }
    } catch {
      setHasError(true)
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

  const addStudy = useCallback((study: Study) => {
    setStudies((prev) => [study, ...dataGuard(prev)])
  }, [])

  const removeRecommendation = useCallback((id: string) => {
    setRecommendations((prev) => dataGuard(prev).filter((r) => r.id !== id))
  }, [])

  return {
    children,
    studies,
    recommendations,
    isLoading,
    hasError,
    addStudy,
    removeRecommendation,
    refetch: loadData,
  }
}
