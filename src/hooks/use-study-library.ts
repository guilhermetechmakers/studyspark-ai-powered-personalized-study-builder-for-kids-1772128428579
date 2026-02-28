/**
 * Study Library data hooks - Centralized fetching with safe defaults.
 * Uses live database data only; no mock/demo fallbacks.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  fetchStudies,
  fetchFolders,
  fetchFilterOptions,
  createFolder as apiCreateFolder,
  renameFolder as apiRenameFolder,
  deleteFolder as apiDeleteFolder,
  moveStudiesToFolder,
  duplicateStudy as apiDuplicateStudy,
  exportStudies,
  shareStudies,
  deleteStudies,
  fetchTags,
  createTag,
  updateStudyTags,
} from '@/api/study-library'
import type {
  StudyCardType,
  FolderType,
  TagType,
  StudyLibraryFilters,
} from '@/types/study-library'

const PAGE_SIZE = 12

export function useStudyLibrary(filters: StudyLibraryFilters) {
  const [studies, setStudies] = useState<StudyCardType[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    const load = async () => {
      try {
        const result = await fetchStudies({
          search: filters.search || undefined,
          childId: filters.childId || undefined,
          subjectId: filters.subjectId || undefined,
          learningStyleId: filters.learningStyleId || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          starred: filters.starred,
          folderId: filters.folderId,
          tagIds: filters.tagIds,
          page,
          pageSize: PAGE_SIZE,
        })

        if (cancelled) return

        const data = result?.data ?? []
        const list = Array.isArray(data) ? data : []
        setStudies(list)
        setTotalCount(result?.totalCount ?? list.length)
      } catch (err) {
        if (cancelled) return
        setError((err as Error)?.message ?? 'Failed to load studies')
        setStudies([])
        setTotalCount(0)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [
    filters.search,
    filters.childId,
    filters.subjectId,
    filters.learningStyleId,
    filters.startDate,
    filters.endDate,
    filters.starred,
    filters.folderId,
    filters.tagIds,
    page,
    refreshKey,
  ])

  return {
    studies,
    totalCount,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    isLoading,
    error,
    refetch,
  }
}

export function useStudyLibraryFolders() {
  const [folders, setFolders] = useState<FolderType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    const data = await fetchFolders()
    setFolders(data ?? [])
    setIsLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const createFolder = useCallback(
    async (name: string, parentFolderId?: string | null) => {
      const created = await apiCreateFolder(name, parentFolderId)
      if (created) {
        setFolders((prev) => [...(prev ?? []), created])
        return created
      }
      return null
    },
    []
  )

  const renameFolder = useCallback(async (id: string, name: string) => {
    const updated = await apiRenameFolder(id, name)
    if (updated) {
      setFolders((prev) =>
        (prev ?? []).map((f) => (f.id === id ? { ...f, name } : f))
      )
      return true
    }
    return false
  }, [])

  const deleteFolder = useCallback(async (id: string) => {
    const ok = await apiDeleteFolder(id)
    if (ok) {
      setFolders((prev) => (prev ?? []).filter((f) => f.id !== id))
      return true
    }
    return false
  }, [])

  return {
    folders,
    isLoading,
    createFolder,
    renameFolder,
    deleteFolder,
    refetch: load,
  }
}

export function useStudyLibraryTags() {
  const [tags, setTags] = useState<TagType[]>([])

  const refetch = useCallback(async () => {
    const data = await fetchTags()
    setTags(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { tags, refetch }
}

export function useStudyLibraryFilterOptions() {
  const [options, setOptions] = useState<{
    children: { id: string; name: string }[]
    subjects: { id: string; name: string }[]
    learningStyles: { id: string; name: string }[]
  }>({ children: [], subjects: [], learningStyles: [] })
  const { tags } = useStudyLibraryTags()

  useEffect(() => {
    let cancelled = false
    fetchFilterOptions().then((res) => {
      if (!cancelled) setOptions(res)
    })
    return () => { cancelled = true }
  }, [])

  return {
    children: options.children,
    subjects: options.subjects,
    learningStyles: options.learningStyles,
    tags: tags ?? [],
  }
}

export {
  moveStudiesToFolder,
  apiDuplicateStudy as duplicateStudy,
  exportStudies,
  shareStudies,
  deleteStudies,
  createTag,
  updateStudyTags,
}
