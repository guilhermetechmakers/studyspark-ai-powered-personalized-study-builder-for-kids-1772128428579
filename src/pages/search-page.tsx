/**
 * SearchPage - Full search experience: autocomplete, filters, results, preview.
 * Integrates with page_p005, page_p009, page_p013.
 */

import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  SearchBarAutocomplete,
  FilterDrawer,
  ResultsGrid,
  PaginationControls,
  PreviewPanel,
} from '@/components/search'
import { useSearch } from '@/hooks/use-search'
import { toast } from 'sonner'
import type { ResultItem } from '@/types/search'

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const initialQuery = (searchParams.get('q') ?? '').trim()

  const {
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
    suggestions,
    recentlyUsed,
    suggestionsLoading,
    fetchSuggestions,
    facets,
    facetCounts,
  } = useSearch({
    initialQuery,
    pageSize: 12,
    debounceMs: 300,
  })

  const [previewItem, setPreviewItem] = useState<ResultItem | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const handleSubmit = useCallback((q: string) => {
    setQuery(q)
    setPage(1)
  }, [setQuery, setPage])

  const handleSelectSuggestion = useCallback((s: { text: string }) => {
    setQuery(s.text)
    setPage(1)
  }, [setQuery, setPage])

  const handleResultClick = useCallback((item: ResultItem) => {
    setPreviewItem(item)
    setPreviewOpen(true)
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters({})
    setPage(1)
  }, [setFilters, setPage])

  const safeData = Array.isArray(data) ? data : []

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Search</h1>
          <p className="text-muted-foreground">
            Search across studies, materials, and help docs
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <SearchBarAutocomplete
            value={query}
            onChange={setQuery}
            onSubmit={handleSubmit}
            onSelectSuggestion={handleSelectSuggestion}
            suggestions={suggestions}
            recentlyUsed={recentlyUsed}
            isLoading={suggestionsLoading}
            placeholder="Search studies, materials, help..."
            onSuggestionsRequest={fetchSuggestions}
            className="max-w-2xl"
          />
          <FilterDrawer
            facets={facets}
            selectedFacets={filters}
            onApply={(f) => setFilters(f)}
            onClear={handleClearFilters}
            counts={facetCounts}
          />
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <ResultsGrid
          results={safeData}
          total={total}
          loading={loading}
          view="grid"
          onOpen={handleResultClick}
          emptyMessage="No results found. Try broadening your search or filters."
        />

        {total > 0 && (
          <PaginationControls
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            isLoading={loading}
          />
        )}
      </div>

      <PreviewPanel
        item={previewItem}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onEdit={() => {
          toast.info('Edit study (navigate to detail)')
          setPreviewOpen(false)
        }}
        onSave={(it) => toast.success(`Saved: ${it.title}`)}
        onShare={(it) => toast.success(`Share: ${it.title}`)}
      />
    </div>
  )
}
