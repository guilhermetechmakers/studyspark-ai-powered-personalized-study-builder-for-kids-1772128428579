/**
 * Study generation hooks - Create study, stream generation.
 * Uses studies API (createStudy, streamGeneration) and profile API.
 * Enforces runtime safety with (items ?? []).map and Array.isArray guards.
 */

import { useState, useCallback, useEffect } from 'react'
import { prepareStudy } from '@/api/studies'
import { fetchChildProfiles } from '@/api/profile'
import type { AIOutputBlock } from '@/types/study-wizard'
import type { ChildProfile } from '@/types/profile'
import { dataGuard } from '@/lib/data-guard'

export function useChildProfilesForStudy() {
  const [children, setChildren] = useState<ChildProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    const list = await fetchChildProfiles()
    setChildren(dataGuard(list))
    setIsLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { children, isLoading, refetch: load }
}

export function useStudyGeneration() {
  const [studyId, setStudyId] = useState<string | null>(null)
  const [blocks, setBlocks] = useState<AIOutputBlock[]>([])
  const [progress, setProgress] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createNewStudy = useCallback(
    async (input: {
      topic: string
      subject?: string
      contextNotes?: string
      childProfileId?: string | null
      learningStyle: string
      age: number
      generationOptions?: { depth?: string; outputs?: string[]; curriculumAligned?: boolean }
    }) => {
      setIsCreating(true)
      setError(null)
      try {
        const res = await prepareStudy({
          topic: input.topic,
          subject: input.subject,
          contextNotes: input.contextNotes,
          childProfile: { id: input.childProfileId ?? '', age: input.age, grade: '', learningPreferences: [] },
          learningStyle: input.learningStyle,
        })
        const id = res?.studyId ?? null
        if (id) {
          setStudyId(id)
          setBlocks([])
          setProgress(0)
          return id
        }
      } catch (err) {
        setError((err as Error)?.message ?? 'Failed to create study')
      }
      setIsCreating(false)
      return null
    },
    []
  )

  const startGeneration = useCallback(async (sid: string) => {
    if (!sid) return
    setIsGenerating(true)
    setError(null)
    setBlocks([])
    setProgress(0)

    const collectedBlocks: AIOutputBlock[] = []

    try {
      const { streamStudyGeneration } = await import('@/api/studies')
      await streamStudyGeneration(sid, {
        onBlock: (block: AIOutputBlock) => {
          collectedBlocks.push(block)
          setBlocks([...collectedBlocks])
        },
        onProgress: (pct: number) => setProgress(pct),
        onComplete: () => setIsGenerating(false),
        onError: (err: Error) => {
          setError(err.message)
          setIsGenerating(false)
        },
      })
      setIsGenerating(false)
    } catch (err) {
      setError((err as Error)?.message ?? 'Generation failed')
      setIsGenerating(false)
    }
  }, [])

  return {
    studyId,
    blocks,
    progress,
    isGenerating,
    isCreating,
    error,
    setBlocks,
    createNewStudy,
    startGeneration,
    setError,
  }
}
