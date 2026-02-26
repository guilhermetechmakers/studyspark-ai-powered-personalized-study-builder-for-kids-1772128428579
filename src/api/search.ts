/**
 * Search API - Studies, materials, help docs.
 * Uses Supabase Edge Functions. Enforces runtime-safe response handling.
 */

import type {
  ResultItem,
  SearchFilters,
  SearchResponse,
  SearchSuggestionsResponse,
  SearchFacetsResponse,
} from '@/types/search'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`
    }
  } catch {
    // ignore
  }
  return headers
}

const RECENT_QUERIES_KEY = 'studyspark-search-recent'

export function getRecentQueries(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_QUERIES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function addRecentQuery(query: string): void {
  if (!query?.trim()) return
  const recent = getRecentQueries()
  const trimmed = query.trim()
  const filtered = recent.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())
  const updated = [trimmed, ...filtered].slice(0, 10)
  try {
    localStorage.setItem(RECENT_QUERIES_KEY, JSON.stringify(updated))
  } catch {
    // ignore
  }
}

export async function search(params: {
  query: string
  filters?: Partial<SearchFilters['facets']>
  page?: number
  limit?: number
  sort?: string
  ownership?: SearchFilters['ownership']
  types?: ('study' | 'material' | 'help')[]
}): Promise<SearchResponse> {
  const headers = await getAuthHeaders()
  const body = {
    query: params.query?.trim() ?? '',
    filters: {
      ...params.filters,
      types: params.types ?? ['study', 'material', 'help'],
    } as Record<string, unknown>,
    page: params.page ?? 1,
    limit: params.limit ?? 12,
    sort: params.sort,
    ownership: params.ownership,
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/search`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    try {
      const { fetchStudies } = await import('@/api/study-library')
      const { data: studies, totalCount } = await fetchStudies({
        search: params.query?.trim() || undefined,
        subjectId: (params.filters?.subject as string[])?.[0],
        learningStyleId: (params.filters?.style as string[])?.[0],
        page: params.page ?? 1,
        pageSize: params.limit ?? 12,
      })
      const list = Array.isArray(studies) ? studies : []
      const results: ResultItem[] = list.map((s) => ({
        id: s.id,
        type: 'study' as const,
        title: s.title ?? 'Untitled',
        snippet: (s.description ?? '').slice(0, 120) || 'Study set',
        ownerId: s.ownerId ?? '',
        sharedWith: [],
        subject: s.subject ?? null,
        childAgeGroup: null,
        style: s.learningStyle ?? null,
        createdAt: s.lastModified ?? '',
        updatedAt: s.lastModified ?? '',
        url: `/dashboard/studies/${s.id}`,
      }))
      return { data: results, total: totalCount }
    } catch {
      throw new Error(res.statusText || 'Search failed')
    }
  }

  const json = (await res.json()) as { data?: ResultItem[]; total?: number }
  const data = Array.isArray(json?.data) ? json.data : []
  const total = typeof json?.total === 'number' ? json.total : 0

  return { data, total }
}

export async function fetchSearchSuggestions(query: string): Promise<SearchSuggestionsResponse> {
  const headers = await getAuthHeaders()
  const recent = getRecentQueries()
  const qs = new URLSearchParams()
  if (query?.trim()) qs.set('query', query.trim())

  const res = await fetch(`${supabaseUrl}/functions/v1/search-suggestions?${qs.toString()}`, {
    method: 'GET',
    headers: {
      ...headers,
      'X-Recent-Queries': JSON.stringify(recent),
    },
  })

  if (!res.ok) {
    return { suggestions: [], recentlyUsed: recent }
  }

  const json = (await res.json()) as SearchSuggestionsResponse
  const suggestions = Array.isArray(json?.suggestions) ? json.suggestions : []
  const recentlyUsed = Array.isArray(json?.recentlyUsed) ? json.recentlyUsed : recent

  return { suggestions, recentlyUsed }
}

export async function fetchSearchFacets(): Promise<SearchFacetsResponse> {
  const headers = await getAuthHeaders()

  const res = await fetch(`${supabaseUrl}/functions/v1/search-facets`, {
    method: 'GET',
    headers,
  })

  if (!res.ok) {
    return {
      facets: { children: [], subjects: [], styles: [], dates: ['Last 7 days', 'Last 30 days', 'Last 90 days'] },
      counts: {},
    }
  }

  const json = (await res.json()) as SearchFacetsResponse
  const facets = json?.facets ?? { children: [], subjects: [], styles: [], dates: [] }
  const counts = json?.counts ?? {}

  return {
    facets: {
      children: Array.isArray(facets.children) ? facets.children : [],
      subjects: Array.isArray(facets.subjects) ? facets.subjects : [],
      styles: Array.isArray(facets.styles) ? facets.styles : [],
      dates: Array.isArray(facets.dates) ? facets.dates : ['Last 7 days', 'Last 30 days', 'Last 90 days'],
    },
    counts: typeof counts === 'object' && counts !== null ? counts : {},
  }
}
