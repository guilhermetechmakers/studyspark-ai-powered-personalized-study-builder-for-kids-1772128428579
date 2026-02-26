/**
 * useSearch - Search across studies, materials, help docs.
 * Returns data, total, loading, error. Guards API response shapes.
 */

import { useState, useCallback, useEffect } from 'react'
import { search, fetchSearchSuggestions, fetchSearchFacets, addRecentQuery } from '@/api/search'
import type { ResultItem, SuggestionItem, SearchFiltersFacets } from '@/types/search'

export interface UseSearchOptions {
  initialQuery?: string
  initialFilters?: Partial<SearchFiltersFacets>
  pageSize?: number
  debounceMs?: number
}

export interface UseSearchReturn {
  data: ResultItem[]
  total: number
  loading: boolean
  error: string | null
  query: string
  setQuery: (q: string) => void
  filters: Partial<SearchFiltersFacets>
  setFilters: (f: Partial<SearchFiltersFacets> | ((prev: Partial<SearchFiltersFacets>) => Partial<SearchFiltersFacets>)) => void
  page: number
  setPage: (p: number) => void
  pageSize: number
  setPageSize: (s: number) => void
  refetch: () => Promise<void>
  suggestions: SuggestionItem[]
  recentlyUsed: string[]
  suggestionsLoading: boolean
  fetchSuggestions: (q: string) => Promise<void>
  facets: { children: string[]; subjects: string[]; styles: string[]; dates: string[] }
  facetCounts: Record<string, number>
  facetsLoading: boolean
}

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const {
    initialQuery = '',
    initialFilters = {},
    pageSize: initialPageSize = 12,
    debounceMs = 300,
  } = options

  const [query, setQuery] = useState(initialQuery)
  const [filters, setFiltersState] = useState<Partial<SearchFiltersFacets>>(initialFilters)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [data, setData] = useState<ResultItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [facets, setFacets] = useState<UseSearchReturn['facets']>({
    children: [],
    subjects: [],
    styles: [],
    dates: ['Last 7 days', 'Last 30 days', 'Last 90 days'],
  })
  const [facetCounts, setFacetCounts] = useState<Record<string, number>>({})
  const [facetsLoading, setFacetsLoading] = useState(false)

  const setFilters = useCallback(
    (f: Partial<SearchFiltersFacets> | ((prev: Partial<SearchFiltersFacets>) => Partial<SearchFiltersFacets>)) => {
      setFiltersState((prev) => (typeof f === 'function' ? f(prev) : f))
      setPage(1)
    },
    []
  )

  const doSearch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await search({
        query,
        filters,
        page,
        limit: pageSize,
        types: ['study', 'material', 'help'],
      })
      const list = Array.isArray(res?.data) ? res.data : []
      const count = typeof res?.total === 'number' ? res.total : 0
      setData(list)
      setTotal(count)
      if (query.trim()) addRecentQuery(query.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setData([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [query, filters, page, pageSize])

  const refetch = useCallback(() => doSearch(), [doSearch])

  useEffect(() => {
    const timer = setTimeout(() => doSearch(), debounceMs)
    return () => clearTimeout(timer)
  }, [query, JSON.stringify(filters), page, pageSize, debounceMs])

  const fetchSuggestions = useCallback(async (q: string) => {
    setSuggestionsLoading(true)
    try {
      const res = await fetchSearchSuggestions(q)
      setSuggestions(Array.isArray(res?.suggestions) ? res.suggestions : [])
      setRecentlyUsed(Array.isArray(res?.recentlyUsed) ? res.recentlyUsed : [])
    } catch {
      setSuggestions([])
    } finally {
      setSuggestionsLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setFacetsLoading(true)
    fetchSearchFacets()
      .then((res) => {
        if (cancelled) return
        const f = res?.facets ?? { children: [], subjects: [], styles: [], dates: ['Last 7 days', 'Last 30 days', 'Last 90 days'] }
        setFacets(f)
        setFacetCounts(res?.counts ?? {})
      })
      .catch(() => {
        if (!cancelled) setFacetsLoading(false)
      })
      .finally(() => {
        if (!cancelled) setFacetsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return {
    data,
    total,
    loading,
    error,
    query,
    setQuery,
    filters,
    setFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    refetch,
    suggestions,
    recentlyUsed,
    suggestionsLoading,
    fetchSuggestions,
    facets,
    facetCounts,
    facetsLoading,
  }
}
