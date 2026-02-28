/**
 * Library Management API - Supabase-backed studies, folders, tags, search, audit.
 * Uses Supabase client directly. Enforces data ?? [] and Array.isArray guards.
 */

import { supabase } from '@/lib/supabase'
import type {
  StudyCardType,
  FolderType,
  TagType,
  StudyLibraryFilters,
  LibraryAuditLog,
} from '@/types/study-library'

const PAGE_SIZE_DEFAULT = 12

function asArray<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : []
}

function toStudyCard(row: Record<string, unknown>, tags: TagType[] = []): StudyCardType {
  const id = String(row.id ?? '')
  const studyTags = tags.filter((t) => t.id)
  const tagNames = studyTags.map((t) => t.name)
  return {
    id,
    title: String(row.title ?? row.topic ?? 'Untitled'),
    lastModified: String(row.updated_at ?? row.created_at ?? ''),
    subject: String(row.subject ?? ''),
    subjectId: row.subject ? String(row.subject) : undefined,
    learningStyle: String(row.learning_style ?? ''),
    learningStyleId: row.learning_style ? String(row.learning_style) : undefined,
    childId: row.child_profile_id ? String(row.child_profile_id) : undefined,
    folderId: row.folder_id ? String(row.folder_id) : null,
    tags: tagNames,
    tagObjects: studyTags,
    description: row.description ? String(row.description) : undefined,
    isPublic: Boolean(row.is_public),
    version: typeof row.version === 'number' ? row.version : 1,
  }
}

function toFolder(row: Record<string, unknown>): FolderType {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    parentFolderId: row.parent_folder_id ? String(row.parent_folder_id) : null,
    position: typeof row.position_order === 'number' ? row.position_order : 0,
    positionOrder: typeof row.position_order === 'number' ? row.position_order : 0,
    childCount: 0,
    ownerId: row.owner_id ? String(row.owner_id) : undefined,
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
    isDeleted: Boolean(row.is_deleted),
  }
}

function toTag(row: Record<string, unknown>): TagType {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    color: row.color ? String(row.color) : undefined,
    ownerId: row.owner_id ? String(row.owner_id) : undefined,
    createdAt: row.created_at ? String(row.created_at) : undefined,
  }
}

/** Fetch studies with filters and pagination */
export async function fetchStudiesSupabase(
  filters: StudyLibraryFilters
): Promise<{ data: StudyCardType[]; totalCount: number }> {
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? PAGE_SIZE_DEFAULT
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('studies')
    .select('id, topic, title, subject, learning_style, child_profile_id, folder_id, description, is_public, version, created_at, updated_at', { count: 'exact' })
    .eq('is_deleted', false)

  if (filters.folderId != null && filters.folderId !== '' && filters.folderId !== 'all') {
    query = query.eq('folder_id', filters.folderId)
  }
  if (filters.childId) {
    query = query.eq('child_profile_id', filters.childId)
  }
  if (filters.subjectId) {
    query = query.eq('subject', filters.subjectId)
  }
  if (filters.learningStyleId) {
    query = query.eq('learning_style', filters.learningStyleId)
  }
  if (filters.search?.trim()) {
    const q = filters.search.trim()
    query = query.or(`topic.ilike.%${q}%,title.ilike.%${q}%,description.ilike.%${q}%,subject.ilike.%${q}%`)
  }

  if (filters.tagIds && filters.tagIds.length > 0) {
    const { data: tagged } = await supabase
      .from('library_study_tags')
      .select('study_id')
      .in('tag_id', filters.tagIds)
    const studyIds = [...new Set(asArray<Record<string, unknown>>(tagged ?? []).map((r) => String(r.study_id ?? '')).filter(Boolean))]
    if (studyIds.length === 0) return { data: [], totalCount: 0 }
    query = query.in('id', studyIds)
  }

  query = query.order('updated_at', { ascending: false }).range(offset, offset + pageSize - 1)

  const { data: rows, error, count } = await query

  if (error) {
    return { data: [], totalCount: 0 }
  }

  const list = asArray<Record<string, unknown>>(rows)
  const studyIds = list.map((r) => String(r.id ?? '')).filter(Boolean)

  let tagsByStudy: Record<string, TagType[]> = {}
  if (studyIds.length > 0) {
    const { data: studyTags } = await supabase
      .from('library_study_tags')
      .select('study_id, tag_id')
      .in('study_id', studyIds)

    const stList = asArray<Record<string, unknown>>(studyTags)
    const tagIds = [...new Set(stList.map((st) => String(st.tag_id ?? '')).filter(Boolean))]

    if (tagIds.length > 0) {
      const { data: tagRows } = await supabase
        .from('library_tags')
        .select('*')
        .in('id', tagIds)

      const tagList = asArray<Record<string, unknown>>(tagRows).map(toTag)
      const tagMap = Object.fromEntries(tagList.map((t) => [t.id, t]))

      for (const st of stList) {
        const sid = String(st.study_id ?? '')
        const tid = String(st.tag_id ?? '')
        const tag = tagMap[tid]
        if (tag && sid) {
          if (!tagsByStudy[sid]) tagsByStudy[sid] = []
          tagsByStudy[sid].push(tag)
        }
      }
    }
  }

  const data = list.map((r) => toStudyCard(r, tagsByStudy[String(r.id ?? '')] ?? []))
  const totalCount = typeof count === 'number' ? count : data.length

  return { data, totalCount }
}

/** Fetch filter options: children, subjects, learning styles from DB */
export async function fetchFilterOptionsSupabase(): Promise<{
  children: { id: string; name: string }[]
  subjects: { id: string; name: string }[]
  learningStyles: { id: string; name: string }[]
}> {
  const { data: { user } } = await supabase.auth.getUser()
  const children: { id: string; name: string }[] = []
  if (user) {
    const { data: rows } = await supabase
      .from('child_profiles')
      .select('id, name')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    const list = asArray<Record<string, unknown>>(rows ?? [])
    for (const r of list) {
      const id = String(r.id ?? '')
      const name = String(r.name ?? '')
      if (id) children.push({ id, name })
    }
  }

  const { data: studyRows } = await supabase
    .from('studies')
    .select('subject, learning_style')
    .eq('is_deleted', false)
    .limit(500)

  const subjectsMap = new Map<string, string>()
  const stylesMap = new Map<string, string>()
  for (const r of asArray<Record<string, unknown>>(studyRows ?? [])) {
    const sub = String(r.subject ?? '').trim()
    const style = String(r.learning_style ?? '').trim()
    if (sub) subjectsMap.set(sub, sub)
    if (style) stylesMap.set(style, style)
  }

  return {
    children,
    subjects: Array.from(subjectsMap.entries()).map(([id, name]) => ({ id, name })),
    learningStyles: Array.from(stylesMap.entries()).map(([id, name]) => ({ id, name })),
  }
}

/** Fetch folder tree */
export async function fetchFoldersSupabase(): Promise<FolderType[]> {
  const { data: rows, error } = await supabase
    .from('library_folders')
    .select('*')
    .eq('is_deleted', false)
    .order('position_order', { ascending: true })

  if (error) return []

  const list = asArray<Record<string, unknown>>(rows).map(toFolder)

  const { data: counts } = await supabase
    .from('studies')
    .select('folder_id')
    .eq('is_deleted', false)
    .eq('is_deleted', false)

  const countMap: Record<string, number> = {}
  for (const r of asArray<Record<string, unknown>>(counts ?? [])) {
    const fid = r.folder_id ? String(r.folder_id) : null
    if (fid) countMap[fid] = (countMap[fid] ?? 0) + 1
  }

  return list.map((f) => ({
    ...f,
    childCount: countMap[f.id] ?? 0,
  }))
}

/** Create folder */
export async function createFolderSupabase(
  name: string,
  parentFolderId?: string | null
): Promise<FolderType | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: siblings } = await supabase
    .from('library_folders')
    .select('position_order')
    .eq('parent_folder_id', parentFolderId ?? null)
    .order('position_order', { ascending: false })
    .limit(1)

  const sibList = asArray<Record<string, unknown>>(siblings ?? [])
  const nextOrder = sibList.length > 0
    ? (typeof sibList[0]?.position_order === 'number' ? sibList[0].position_order : 0) + 1
    : 0

  const { data: row, error } = await supabase
    .from('library_folders')
    .insert({
      owner_id: user.id,
      name: name.trim(),
      parent_folder_id: parentFolderId ?? null,
      position_order: nextOrder,
    })
    .select()

    .single()

  if (error || !row) return null
  return toFolder(row as Record<string, unknown>)
}

/** Rename folder */
export async function renameFolderSupabase(id: string, name: string): Promise<FolderType | null> {
  const { data: row, error } = await supabase
    .from('library_folders')
    .update({ name: name.trim(), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error || !row) return null
  return toFolder(row as Record<string, unknown>)
}

/** Soft delete folder */
export async function deleteFolderSupabase(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('library_folders')
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return false

  await supabase
    .from('studies')
    .update({ folder_id: null })
    .eq('folder_id', id)

  return true
}

/** Move folder (change parent) */
export async function moveFolderSupabase(
  folderId: string,
  newParentId: string | null
): Promise<boolean> {
  const { error } = await supabase
    .from('library_folders')
    .update({ parent_folder_id: newParentId, updated_at: new Date().toISOString() })
    .eq('id', folderId)

  return !error
}

/** Create minimal study (Quick Create from library) */
export async function createStudySupabase(
  title: string,
  folderId?: string | null
): Promise<StudyCardType | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const topic = title.trim() || 'Untitled'
  const { data: row, error } = await supabase
    .from('studies')
    .insert({
      user_id: user.id,
      topic,
      title: topic,
      folder_id: folderId ?? null,
      status: 'draft',
      learning_style: 'playful',
      age: 8,
    })
    .select('id, topic, title, subject, learning_style, child_profile_id, folder_id, description, is_public, version, created_at, updated_at')
    .single()

  if (error || !row) return null
  return toStudyCard(row as Record<string, unknown>, [])
}

/** Move studies to folder */
export async function moveStudiesToFolderSupabase(
  studyIds: string[],
  targetFolderId: string | null
): Promise<boolean> {
  if (studyIds.length === 0) return true

  const { error } = await supabase
    .from('studies')
    .update({ folder_id: targetFolderId, updated_at: new Date().toISOString() })
    .in('id', studyIds)

  return !error
}

/** Duplicate study (uses Edge Function) */
export async function duplicateStudySupabase(id: string): Promise<StudyCardType | null> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  if (!token) return null

  const res = await fetch(`${supabaseUrl}/functions/v1/studies-duplicate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ studyId: id }),
  })

  if (!res.ok) return null

  const body = (await res.json()) as { id?: string }
  const newId = body?.id
  if (!newId) return null

  const { data: row } = await supabase
    .from('studies')
    .select('id, topic, subject, learning_style, child_profile_id, folder_id, description, is_public, version, created_at, updated_at')
    .eq('id', newId)
    .single()

  if (!row) return null
  return toStudyCard(row as Record<string, unknown>, [])
}

/** Fetch tags */
export async function fetchTagsSupabase(): Promise<TagType[]> {
  const { data: rows, error } = await supabase
    .from('library_tags')
    .select('*')
    .order('name', { ascending: true })

  if (error) return []
  return asArray<Record<string, unknown>>(rows).map(toTag)
}

/** Create tag */
export async function createTagSupabase(name: string, color?: string): Promise<TagType | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: row, error } = await supabase
    .from('library_tags')
    .insert({ owner_id: user.id, name: name.trim().toLowerCase(), color: color ?? null })
    .select()
    .single()

  if (error || !row) return null
  return toTag(row as Record<string, unknown>)
}

/** Delete tag */
export async function deleteTagSupabase(id: string): Promise<boolean> {
  const { error } = await supabase.from('library_tags').delete().eq('id', id)
  return !error
}

/** Add tags to study */
export async function addStudyTagsSupabase(studyId: string, tagIds: string[]): Promise<boolean> {
  if (tagIds.length === 0) return true

  const rows = tagIds.map((tag_id) => ({ study_id: studyId, tag_id }))
  const { error } = await supabase.from('library_study_tags').upsert(rows, {
    onConflict: 'study_id,tag_id',
  })

  return !error
}

/** Remove tags from study */
export async function removeStudyTagsSupabase(studyId: string, tagIds: string[]): Promise<boolean> {
  if (tagIds.length === 0) return true

  const { error } = await supabase
    .from('library_study_tags')
    .delete()
    .eq('study_id', studyId)
    .in('tag_id', tagIds)

  return !error
}

/** Set study tags (replace existing with new set) */
export async function setStudyTagsSupabase(
  studyId: string,
  tagIds: string[]
): Promise<boolean> {
  const { data: existing } = await supabase
    .from('library_study_tags')
    .select('tag_id')
    .eq('study_id', studyId)
  const existingIds = asArray<Record<string, unknown>>(existing ?? []).map((r) => String(r.tag_id ?? ''))
  const toRemove = existingIds.filter((id) => !tagIds.includes(id))
  const toAdd = tagIds.filter((id) => !existingIds.includes(id))
  const [removeOk, addOk] = await Promise.all([
    toRemove.length > 0 ? removeStudyTagsSupabase(studyId, toRemove) : Promise.resolve(true),
    toAdd.length > 0 ? addStudyTagsSupabase(studyId, toAdd) : Promise.resolve(true),
  ])
  return removeOk && addOk
}

/** Bulk add tags to multiple studies */
export async function bulkAddTagsToStudiesSupabase(
  studyIds: string[],
  tagIds: string[]
): Promise<boolean> {
  if (studyIds.length === 0 || tagIds.length === 0) return true

  const rows: { study_id: string; tag_id: string }[] = []
  for (const sid of studyIds) {
    for (const tid of tagIds) {
      rows.push({ study_id: sid, tag_id: tid })
    }
  }
  const { error } = await supabase
    .from('library_study_tags')
    .upsert(rows, { onConflict: 'study_id,tag_id' })

  return !error
}

/** Soft delete studies */
export async function deleteStudiesSupabase(studyIds: string[]): Promise<boolean> {
  if (studyIds.length === 0) return true

  const { error } = await supabase
    .from('studies')
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .in('id', studyIds)

  return !error
}

/** Fetch audit logs */
export async function fetchAuditLogsSupabase(
  resourceType?: string,
  resourceId?: string,
  limit = 50
): Promise<LibraryAuditLog[]> {
  let query = supabase
    .from('library_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (resourceType) query = query.eq('resource_type', resourceType)
  if (resourceId) query = query.eq('resource_id', resourceId)

  const { data: rows, error } = await query

  if (error) return []

  const validTypes = ['study', 'folder', 'tag'] as const
  const validActions = ['created', 'updated', 'duplicated', 'moved', 'deleted', 'shared', 'tag_added', 'tag_removed'] as const
  return asArray<Record<string, unknown>>(rows).map((r) => {
    const rt = String(r.resource_type ?? '')
    const resourceType = validTypes.includes(rt as (typeof validTypes)[number])
      ? (rt as (typeof validTypes)[number])
      : 'study'
    const actionStr = String(r.action ?? '')
    const action = validActions.includes(actionStr as (typeof validActions)[number])
      ? (actionStr as (typeof validActions)[number])
      : 'updated'
    return {
      id: String(r.id ?? ''),
      resourceType,
      resourceId: String(r.resource_id ?? ''),
      action,
      performedBy: r.performed_by ? String(r.performed_by) : '',
      timestamp: String(r.created_at ?? ''),
      details: (r.details as Record<string, unknown>) ?? {},
    }
  })
}

/** Log audit event */
export async function logAuditSupabase(
  resourceType: string,
  resourceId: string,
  action: string,
  details?: Record<string, unknown>
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('library_audit_logs').insert({
    resource_type: resourceType,
    resource_id: resourceId,
    action,
    performed_by: user.id,
    details: details ?? {},
  })
}
