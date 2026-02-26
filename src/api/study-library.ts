/**
 * Study Library API - Centralized data fetching for studies, folders, tags.
 * Uses native fetch via src/lib/api.ts. Enforces data ?? [] at every step.
 */

import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
import { normalizeApiResponse, asArray } from '@/lib/data-guard'
import type {
  StudyCardType,
  FolderType,
  TagType,
  StudyLibraryApiResponse,
} from '@/types/study-library'

export interface StudiesQueryParams {
  search?: string
  childId?: string
  subjectId?: string
  learningStyleId?: string
  startDate?: string
  endDate?: string
  starred?: boolean
  folderId?: string | null
  page?: number
  pageSize?: number
}

/** GET /api/studies - Fetch studies with filters and pagination */
export async function fetchStudies(
  params: StudiesQueryParams = {}
): Promise<{ data: StudyCardType[]; totalCount: number }> {
  try {
    const q = new URLSearchParams()
    if (params.search) q.set('search', params.search)
    if (params.childId) q.set('childId', params.childId)
    if (params.subjectId) q.set('subjectId', params.subjectId)
    if (params.learningStyleId) q.set('learningStyleId', params.learningStyleId)
    if (params.startDate) q.set('startDate', params.startDate)
    if (params.endDate) q.set('endDate', params.endDate)
    if (params.starred !== undefined) q.set('starred', String(params.starred))
    if (params.folderId != null && params.folderId !== '') q.set('folderId', String(params.folderId))
    if (params.page != null) q.set('page', String(params.page))
    if (params.pageSize != null) q.set('pageSize', String(params.pageSize))

    const res = await apiGet<StudyLibraryApiResponse<StudyCardType> | StudyCardType[]>(
      `/api/studies?${q.toString()}`
    )
    const data = Array.isArray(res) ? res : (res as StudyLibraryApiResponse<StudyCardType>)?.data
    const list = asArray<StudyCardType>(data)
    const totalCount = Array.isArray(res)
      ? (res as StudyCardType[]).length
      : (res as StudyLibraryApiResponse<StudyCardType>)?.totalCount ?? list.length
    return { data: list, totalCount }
  } catch {
    return { data: [], totalCount: 0 }
  }
}

/** GET /api/folders - Fetch folder tree */
export async function fetchFolders(): Promise<FolderType[]> {
  try {
    const res = await apiGet<{ data?: FolderType[] } | FolderType[]>(`/api/folders`)
    const raw = Array.isArray(res) ? res : (res as { data?: FolderType[] })?.data
    return normalizeApiResponse<FolderType>(raw)
  } catch {
    return []
  }
}

/** POST /api/folders - Create folder */
export async function createFolder(
  name: string,
  parentFolderId?: string | null
): Promise<FolderType | null> {
  try {
    const res = await apiPost<FolderType>(`/api/folders`, { name, parentFolderId })
    return res ?? null
  } catch {
    return null
  }
}

/** PUT /api/folders/{id} - Rename folder */
export async function renameFolder(id: string, name: string): Promise<FolderType | null> {
  try {
    const res = await apiPut<FolderType>(`/api/folders/${id}`, { name })
    return res ?? null
  } catch {
    return null
  }
}

/** DELETE /api/folders/{id} - Delete folder */
export async function deleteFolder(id: string): Promise<boolean> {
  try {
    await apiDelete(`/api/folders/${id}`)
    return true
  } catch {
    return false
  }
}

/** POST /api/folders/{folderId}/move - Move studies to folder */
export async function moveStudiesToFolder(
  studyIds: string[],
  targetFolderId: string | null
): Promise<boolean> {
  try {
    await apiPost(`/api/folders/move`, { studyIds, targetFolderId })
    return true
  } catch {
    return false
  }
}

/** POST /api/studies/{id}/duplicate - Duplicate study */
export async function duplicateStudy(id: string): Promise<StudyCardType | null> {
  try {
    const res = await apiPost<StudyCardType>(`/api/studies/${id}/duplicate`, {})
    return res ?? null
  } catch {
    return null
  }
}

/** POST /api/studies/export - Bulk export */
export async function exportStudies(studyIds: string[], format: 'pdf' | 'json'): Promise<Blob | null> {
  try {
    const API_BASE = import.meta.env.VITE_API_URL ?? ''
    const res = await fetch(`${API_BASE}/api/studies/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studyIds, format }),
    })
    if (!res.ok) return null
    return res.blob()
  } catch {
    return null
  }
}

/** POST /api/studies/share - Bulk share */
export async function shareStudies(
  studyIds: string[],
  shareToUser?: string
): Promise<{ success: boolean }> {
  try {
    await apiPost(`/api/studies/share`, { studyIds, shareToUser })
    return { success: true }
  } catch {
    return { success: false }
  }
}

/** DELETE /api/studies - Bulk delete */
export async function deleteStudies(studyIds: string[]): Promise<boolean> {
  try {
    await apiPost(`/api/studies/delete`, { studyIds })
    return true
  } catch {
    return false
  }
}

/** GET /api/tags - Fetch tags */
export async function fetchTags(): Promise<TagType[]> {
  try {
    const res = await apiGet<{ data?: TagType[] } | TagType[]>(`/api/tags`)
    const raw = Array.isArray(res) ? res : (res as { data?: TagType[] })?.data
    return normalizeApiResponse<TagType>(raw)
  } catch {
    return []
  }
}
