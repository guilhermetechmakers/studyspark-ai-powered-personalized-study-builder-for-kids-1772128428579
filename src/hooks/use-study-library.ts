/**
 * Study Library data hooks - Centralized fetching with safe defaults.
 * Enforces data ?? [] at every step. Falls back to mock when API unavailable.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  fetchStudies,
  fetchFolders,
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
import {
  mockStudyLibraryStudies,
  mockStudyLibraryFolders,
  mockStudyLibraryTags,
  mockSubjects,
  mockLearningStyles,
} from '@/data/study-library-mock'
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
      let result: { data: StudyCardType[]; totalCount: number }
      try {
        result = await fetchStudies({
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
      } catch {
        result = { data: [], totalCount: 0 }
      }

      if (cancelled) return

      const data = result?.data ?? []
      const list = Array.isArray(data) ? data : []

      if (list.length === 0) {
        const mockFiltered = filterMockStudies(mockStudyLibraryStudies, filters, mockStudyLibraryTags ?? [])
        const start = (page - 1) * PAGE_SIZE
        const paginated = (mockFiltered ?? []).slice(start, start + PAGE_SIZE)
        setStudies(paginated)
        setTotalCount((mockFiltered ?? []).length)
      } else {
        setStudies(list)
        setTotalCount(result?.totalCount ?? list.length)
      }

      setIsLoading(false)
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

function filterMockStudies(
  items: StudyCardType[],
  filters: StudyLibraryFilters,
  allTags: TagType[] = []
): StudyCardType[] {
  const list = items ?? []
  const tagList = allTags ?? []
  return list.filter((s) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const match =
        s.title?.toLowerCase().includes(q) ||
        (s.subject ?? '').toLowerCase().includes(q) ||
        (s.learningStyle ?? '').toLowerCase().includes(q) ||
        (s.tags ?? []).some((t) => t.toLowerCase().includes(q))
      if (!match) return false
    }
    if (filters.childId && s.childId !== filters.childId) return false
    if (filters.subjectId && s.subjectId !== filters.subjectId) return false
    if (filters.learningStyleId && s.learningStyleId !== filters.learningStyleId) return false
    if (filters.starred && !s.isStarred) return false
    if (filters.folderId != null) {
      if (filters.folderId === '' || filters.folderId === 'all') return true
      if (s.folderId !== filters.folderId) return false
    }
    if (filters.tagIds && filters.tagIds.length > 0) {
      const tagNames = filters.tagIds
        .map((tid) => tagList.find((t) => t.id === tid)?.name)
        .filter(Boolean) as string[]
      const studyTags = (s.tags ?? []).map((t) => t.toLowerCase())
      const hasTag = tagNames.some((n) => studyTags.includes(n.toLowerCase()))
      if (!hasTag) return false
    }
    if (filters.startDate && s.lastModified < filters.startDate) return false
    if (filters.endDate && s.lastModified > filters.endDate) return false
    return true
  })
}

export function useStudyLibraryFolders() {
  const [folders, setFolders] = useState<FolderType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    const data = await fetchFolders()
    const list = data ?? []
    setFolders(list)
    if (list.length === 0) {
      setFolders(mockStudyLibraryFolders ?? [])
    }
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
      const mock: FolderType = {
        id: `f${Date.now()}`,
        name,
        parentFolderId: parentFolderId ?? null,
        position: (folders ?? []).length,
        childCount: 0,
      }
      setFolders((prev) => [...(prev ?? []), mock])
      return mock
    },
    [folders]
  )

  const renameFolder = useCallback(async (id: string, name: string) => {
    const updated = await apiRenameFolder(id, name)
    if (updated) {
      setFolders((prev) =>
        (prev ?? []).map((f) => (f.id === id ? { ...f, name } : f))
      )
      return true
    }
    setFolders((prev) =>
      (prev ?? []).map((f) => (f.id === id ? { ...f, name } : f))
    )
    return true
  }, [])

  const deleteFolder = useCallback(async (id: string) => {
    const ok = await apiDeleteFolder(id)
    if (ok) {
      setFolders((prev) => (prev ?? []).filter((f) => f.id !== id))
      return true
    }
    setFolders((prev) => (prev ?? []).filter((f) => f.id !== id))
    return true
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
    const list = Array.isArray(data) ? data : []
    setTags(list.length > 0 ? list : (mockStudyLibraryTags ?? []))
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { tags, refetch }
}

export function useStudyLibraryFilterOptions() {
  const { tags } = useStudyLibraryTags()
  const children = [
    { id: '1', name: 'Emma' },
    { id: '2', name: 'Liam' },
  ]
  return {
    children,
    subjects: mockSubjects ?? [],
    learningStyles: mockLearningStyles ?? [],
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
