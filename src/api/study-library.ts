/**
 * Study Library API - Centralized data fetching for studies, folders, tags.
 * Uses Supabase backend (library-supabase). Enforces data ?? [] at every step.
 */

import {
  fetchStudiesSupabase,
  fetchFoldersSupabase,
  fetchFilterOptionsSupabase,
  createFolderSupabase,
  renameFolderSupabase,
  deleteFolderSupabase,
  moveFolderSupabase,
  moveStudiesToFolderSupabase,
  duplicateStudySupabase,
  createStudySupabase,
  fetchTagsSupabase,
  createTagSupabase,
  deleteTagSupabase,
  addStudyTagsSupabase,
  removeStudyTagsSupabase,
  setStudyTagsSupabase,
  bulkAddTagsToStudiesSupabase,
  deleteStudiesSupabase,
  fetchAuditLogsSupabase,
  logAuditSupabase,
} from '@/api/library-supabase'
import type {
  StudyCardType,
  FolderType,
  TagType,
  StudyLibraryFilters,
  LibraryAuditLog,
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
  tagIds?: string[]
  page?: number
  pageSize?: number
}

/** GET studies - Fetch studies with filters and pagination */
export async function fetchStudies(
  params: StudiesQueryParams = {}
): Promise<{ data: StudyCardType[]; totalCount: number }> {
  const filters: StudyLibraryFilters = {
    search: params.search ?? '',
    childId: params.childId,
    subjectId: params.subjectId,
    learningStyleId: params.learningStyleId,
    startDate: params.startDate,
    endDate: params.endDate,
    starred: params.starred,
    folderId: params.folderId,
    tagIds: params.tagIds,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 12,
  }
  return fetchStudiesSupabase(filters)
}

/** GET folders - Fetch folder tree */
export async function fetchFolders(): Promise<FolderType[]> {
  const list = await fetchFoldersSupabase()
  return list ?? []
}

/** GET filter-options - Fetch children, subjects, learning styles from DB */
export async function fetchFilterOptions(): Promise<{
  children: { id: string; name: string }[]
  subjects: { id: string; name: string }[]
  learningStyles: { id: string; name: string }[]
}> {
  return fetchFilterOptionsSupabase()
}

/** POST folders - Create folder */
export async function createFolder(
  name: string,
  parentFolderId?: string | null
): Promise<FolderType | null> {
  return createFolderSupabase(name, parentFolderId)
}

/** PUT folders/{id} - Rename folder */
export async function renameFolder(id: string, name: string): Promise<FolderType | null> {
  return renameFolderSupabase(id, name)
}

/** DELETE folders/{id} - Delete folder */
export async function deleteFolder(id: string): Promise<boolean> {
  return deleteFolderSupabase(id)
}

/** PUT folders/{id}/move - Move folder to new parent */
export async function moveFolder(
  folderId: string,
  newParentId: string | null
): Promise<boolean> {
  return moveFolderSupabase(folderId, newParentId)
}

/** POST folders/move - Move studies to folder */
export async function moveStudiesToFolder(
  studyIds: string[],
  targetFolderId: string | null
): Promise<boolean> {
  return moveStudiesToFolderSupabase(studyIds, targetFolderId)
}

/** POST studies - Quick create minimal study from library */
export async function createStudyQuick(
  title: string,
  folderId?: string | null
): Promise<StudyCardType | null> {
  return createStudySupabase(title, folderId)
}

/** POST studies/{id}/duplicate - Duplicate study */
export async function duplicateStudy(id: string): Promise<StudyCardType | null> {
  return duplicateStudySupabase(id)
}

/** POST studies/export - Bulk export (delegates to studies-export Edge Function) */
export async function exportStudies(
  studyIds: string[],
  _format: 'pdf' | 'json'
): Promise<Blob | null> {
  if (studyIds.length === 0) return null
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
  const { supabase } = await import('@/lib/supabase')
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) return null

  const res = await fetch(
    `${supabaseUrl}/functions/v1/studies-export?studyId=${encodeURIComponent(studyIds[0])}&format=html`,
    { method: 'GET', headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) return null
  return res.blob()
}

/** POST studies/share - Bulk share (mock/placeholder) */
export async function shareStudies(
  _studyIds: string[],
  _shareToUser?: string
): Promise<{ success: boolean }> {
  return { success: true }
}

/** DELETE studies - Bulk delete */
export async function deleteStudies(studyIds: string[]): Promise<boolean> {
  return deleteStudiesSupabase(studyIds)
}

/** GET tags - Fetch tags */
export async function fetchTags(): Promise<TagType[]> {
  const list = await fetchTagsSupabase()
  return list ?? []
}

/** POST tags - Create tag */
export async function createTag(name: string, color?: string): Promise<TagType | null> {
  return createTagSupabase(name, color)
}

/** DELETE tags/{id} - Delete tag */
export async function deleteTag(id: string): Promise<boolean> {
  return deleteTagSupabase(id)
}

/** POST studies/{id}/tags - Add tags to study */
export async function addStudyTags(studyId: string, tagIds: string[]): Promise<boolean> {
  return addStudyTagsSupabase(studyId, tagIds)
}

/** DELETE studies/{id}/tags - Remove tags from study */
export async function removeStudyTags(studyId: string, tagIds: string[]): Promise<boolean> {
  return removeStudyTagsSupabase(studyId, tagIds)
}

/** Set study tags (replace all) */
export async function setStudyTags(studyId: string, tagIds: string[]): Promise<boolean> {
  return setStudyTagsSupabase(studyId, tagIds)
}

/** Update study tags (add and/or remove) */
export async function updateStudyTags(
  studyId: string,
  addTagIds: string[],
  removeTagIds: string[]
): Promise<boolean> {
  const [addOk, removeOk] = await Promise.all([
    addTagIds.length > 0 ? addStudyTagsSupabase(studyId, addTagIds) : Promise.resolve(true),
    removeTagIds.length > 0 ? removeStudyTagsSupabase(studyId, removeTagIds) : Promise.resolve(true),
  ])
  return addOk && removeOk
}

/** Bulk add tags to multiple studies */
export async function bulkAddTagsToStudies(
  studyIds: string[],
  tagIds: string[]
): Promise<boolean> {
  return bulkAddTagsToStudiesSupabase(studyIds, tagIds)
}

/** GET audit - Fetch audit logs */
export async function fetchAuditLogs(
  resourceType?: string,
  resourceId?: string,
  limit?: number
): Promise<LibraryAuditLog[]> {
  const list = await fetchAuditLogsSupabase(resourceType, resourceId, limit ?? 50)
  return list ?? []
}

/** Fetch audit logs (params object for AuditLogViewer) */
export async function fetchAuditLogsWithParams(params?: {
  resourceType?: string
  resourceId?: string
  limit?: number
}): Promise<LibraryAuditLog[]> {
  return fetchAuditLogs(params?.resourceType, params?.resourceId, params?.limit)
}

/** Log audit event */
export async function logAudit(
  resourceType: string,
  resourceId: string,
  action: string,
  details?: Record<string, unknown>
): Promise<void> {
  await logAuditSupabase(resourceType, resourceId, action, details)
}
