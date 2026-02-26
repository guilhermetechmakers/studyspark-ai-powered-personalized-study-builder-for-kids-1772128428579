import { useState, useEffect, useCallback } from 'react'
import { fetchChildren, fetchStudies, fetchRecommendations } from '@/api/dashboard'
import type { Child, Study, Recommendation } from '@/types/dashboard'

const MOCK_CHILDREN: Child[] = [
  { id: '1', name: 'Emma', age: 8, progress: 72, streak: 5, lastActive: '2 hours ago' },
  { id: '2', name: 'Liam', age: 10, progress: 45, streak: 2, lastActive: '1 day ago' },
]

const MOCK_STUDIES: Study[] = [
  { id: '1', title: 'Fractions & Decimals', updatedAt: '2 hours ago', status: 'saved' },
  { id: '2', title: 'World War II', updatedAt: '1 day ago', status: 'completed' },
  { id: '3', title: 'Photosynthesis', updatedAt: '2 days ago', status: 'in-progress' },
]

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  { id: '1', topic: 'Multiplication Tables', confidence: 0.92, notes: 'Upcoming math test' },
  { id: '2', topic: 'Solar System', confidence: 0.85, notes: 'From teacher notes' },
  { id: '3', topic: 'Parts of Speech', confidence: 0.78, notes: 'From uploaded materials' },
]

function safeArray<T>(data: unknown): T[] {
  return Array.isArray(data) ? data : []
}

export function useDashboardData() {
  const [children, setChildren] = useState<Child[]>([])
  const [studies, setStudies] = useState<Study[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [childrenRes, studiesRes, recsRes] = await Promise.all([
        fetchChildren(),
        fetchStudies(10),
        fetchRecommendations(),
      ])
      const c = safeArray<Child>(childrenRes)
      const s = safeArray<Study>(studiesRes)
      const r = safeArray<Recommendation>(recsRes)
      setChildren(c.length > 0 ? c : MOCK_CHILDREN)
      setStudies(s.length > 0 ? s : MOCK_STUDIES)
      setRecommendations(r.length > 0 ? r : MOCK_RECOMMENDATIONS)
    } catch {
      setChildren(MOCK_CHILDREN)
      setStudies(MOCK_STUDIES)
      setRecommendations(MOCK_RECOMMENDATIONS)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    children,
    studies,
    recommendations,
    isLoading,
    setStudies,
    setRecommendations,
    refetch: loadData,
  }
}
