/**
 * Study Library types - Content list, folders, tags.
 * All types support runtime-safe defaults.
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
  isStarred?: boolean
}

export interface FolderType {
  id: string
  name: string
  parentFolderId?: string | null
  position?: number
  color?: string
  childCount?: number
}

export interface TagType {
  id: string
  name: string
  category?: string
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
