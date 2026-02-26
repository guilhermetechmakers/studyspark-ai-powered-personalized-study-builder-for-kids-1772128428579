/**
 * Hook for study player: fetches study + draft, creates session, maps to activities.
 * All arrays guarded for runtime safety.
 */

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchStudyReviewSupabase } from '@/api/study-review-supabase'
import { createSession, submitAttempt } from '@/api/study-player'
import { draftToActivities } from '@/lib/draft-to-activities'
import type { StudySet } from '@/types/study-viewer'
import { toast } from 'sonner'

interface UseStudyPlayerOptions {
  studyId: string | null | undefined
  childId?: string | null
}

interface UseStudyPlayerResult {
  studySet: StudySet | null
  sessionToken: string | null
  activityIds: string[]
  isLoading: boolean
  error: string | null
  retry: () => void
}

export function useStudyPlayer({
  studyId,
  childId,
}: UseStudyPlayerOptions): UseStudyPlayerResult {
  const [studySet, setStudySet] = useState<StudySet | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [activityIds, setActivityIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!studyId) {
      setStudySet(null)
      setIsLoading(false)
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      const [reviewData, draftRes] = await Promise.all([
        fetchStudyReviewSupabase(studyId),
        supabase.from('drafts').select('content_payload').eq('study_id', studyId).single(),
      ])
      const payload = (draftRes?.data?.content_payload as Record<string, unknown>) ?? {}

      let ids: string[] = []
      if (childId) {
        const session = await createSession({ childId, studyId })
        setSessionToken(session.sessionToken)
        ids = session.activityIds ?? []
        setActivityIds(ids)
      } else {
        setSessionToken(null)
        setActivityIds([])
      }

      const activities = draftToActivities(payload, studyId, ids.length > 0 ? ids : undefined)
      const progress = {
        total: activities.length,
        completed: 0,
        stars: 0,
        timeSpent: 0,
        streak: 0,
        badges: [] as string[],
      }

      setStudySet({
        id: studyId,
        title: (reviewData?.study?.title as string) ?? 'Study',
        activities,
        progress,
      })
    } catch (err) {
      const msg = (err as Error)?.message ?? 'Failed to load study'
      setError(msg)
      setStudySet(null)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [studyId, childId])

  useEffect(() => {
    void load()
  }, [load])

  return {
    studySet,
    sessionToken,
    activityIds,
    isLoading,
    error,
    retry: load,
  }
}

export function useAttemptSubmit(sessionToken: string | null) {
  return useCallback(
    async (params: {
      activityId: string
      score: number
      timeSpentMs: number
      hintsUsed: number
    }) => {
      if (!sessionToken) return
      try {
        await submitAttempt({
          sessionToken,
          activityId: params.activityId,
          score: params.score,
          timeSpentMs: params.timeSpentMs,
          hintsUsed: params.hintsUsed,
        })
      } catch (err) {
        toast.error((err as Error)?.message ?? 'Failed to save progress')
      }
    },
    [sessionToken]
  )
}
