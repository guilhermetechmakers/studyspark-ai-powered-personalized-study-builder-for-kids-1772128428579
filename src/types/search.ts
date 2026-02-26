/**
 * Search & Filter types - Unified search across studies, materials, help docs.
 * All types support runtime-safe defaults.
 */

export type SearchResultType = 'study' | 'material' | 'help'

export interface ResultItem {
  id: string
  type: SearchResultType
  title: string
  snippet: string
  ownerId: string
  sharedWith: string[]
  subject: string | null
  childAgeGroup: string | null
  style: string | null
  createdAt: string
  updatedAt: string
  isStarred?: boolean
  url?: string
  folderId?: string | null
  tags?: string[]
}

export interface SearchSuggestionsResponse {
  suggestions: SuggestionItem[]
  recentlyUsed?: string[]
}

export interface SearchFacetsResponse {
  facets: {
    children: string[]
    subjects: string[]
    styles: string[]
    dates: string[]
  }
  counts: Record<string, number>
}

export interface SuggestionItem {
  text: string
  type: 'query' | 'topic' | 'recent'
}

export interface SearchFiltersFacets {
  child?: string[]
  subject?: string[]
  style?: string[]
  starred?: boolean
  dateFrom?: string
  dateTo?: string
  type?: SearchResultType[]
}

export interface SearchFilters {
  query: string
  facets: SearchFiltersFacets
  ownership?: 'private' | 'shared' | 'all'
}

/** Flat filters for component state (child, subject, style, etc.) */
export interface SearchFiltersFlat {
  child?: string[]
  subject?: string[]
  style?: string[]
  starred?: boolean
  dateFrom?: string
  dateTo?: string
  ownership?: 'private' | 'shared' | 'all'
  types?: SearchResultType[]
}

export interface SearchParams {
  query: string
  filters: SearchFilters | SearchFiltersFlat
  page: number
  limit: number
  sort?: string
}

/** Alias for SuggestionsResponse */
export type SuggestionsResponse = SearchSuggestionsResponse

/** Alias for FacetsResponse */
export type FacetsResponse = SearchFacetsResponse

export interface SearchResponse {
  data: ResultItem[]
  total: number
}

