/**
 * Study Library types - Content list, folders, tags.
 * All types support runtime-safe defaults.
 * Aligned with library_management migration schema.
 */

export interface StudyCardType {
  id: string
  title: string
  thumbnailUrl?: string
  lastModified: string
  subjectId?: string
  subject?: string
  learningStyleId?: string
  learningStyle?: string
  childId?: string
  childName?: string
  folderId?: string | null
  tags?: string[]
  tagObjects?: TagType[]
  isStarred?: boolean
  ownerId?: string
  description?: string
  isPublic?: boolean
  version?: number
}

export interface FolderType {
  id: string
  name: string
  parentFolderId?: string | null
  position?: number
  positionOrder?: number
  color?: string
  childCount?: number
  ownerId?: string
  createdAt?: string
  updatedAt?: string
  isDeleted?: boolean
}

export interface TagType {
  id: string
  name: string
  color?: string
  category?: string
  ownerId?: string
  createdAt?: string
}

export interface StudyLibraryFilters {
  search: string
  childId?: string
  subjectId?: string
  learningStyleId?: string
  startDate?: string
  endDate?: string
  starred?: boolean
  folderId?: string | null
  tagIds?: string[]
  tag?: string
  isPublic?: boolean
  ownerId?: string
  page?: number
  pageSize?: number
}

export interface StudyLibraryPagination {
  page: number
  pageSize: number
  totalCount: number
}

export interface StudyLibraryApiResponse<T> {
  data: T[]
  totalCount?: number
}

export type AuditAction =
  | 'created'
  | 'updated'
  | 'duplicated'
  | 'moved'
  | 'deleted'
  | 'shared'
  | 'tag_added'
  | 'tag_removed'

export interface LibraryAuditLog {
  id: string
  resourceType: 'study' | 'folder' | 'tag'
  resourceId: string
  action: AuditAction
  performedBy: string
  timestamp: string
  details: Record<string, unknown>
}

export interface StudyPermission {
  id: string
  studyId: string
  userId: string
  role: 'viewer' | 'editor' | 'owner'
  canShare: boolean
  createdAt: string
}

export interface BulkOperationPayload {
  studyIds: string[]
  folderId?: string | null
  tagIds?: string[]
  action: 'move' | 'tag' | 'delete' | 'duplicate'
}
