/**
 * ResultsGrid - Card-based grid/list of search results with safe rendering.
 */

import { ResultCard } from './ResultCard'
import { cn } from '@/lib/utils'
import type { ResultItem } from '@/types/search'

export interface ResultsGridProps {
  results: ResultItem[]
  total: number
  loading: boolean
  view?: 'grid' | 'list'
  onOpen?: (item: ResultItem) => void
  onSave?: (item: ResultItem) => void
  onShare?: (item: ResultItem) => void
  onStar?: (item: ResultItem, starred: boolean) => void
  emptyMessage?: string
  className?: string
}

export function ResultsGrid({
  results,
  total,
  loading,
  view = 'grid',
  onOpen,
  onSave,
  onShare,
  onStar,
  emptyMessage = 'No results found. Try broadening your search or filters.',
  className,
}: ResultsGridProps) {
  const safeResults = Array.isArray(results) ? results : []

  if (loading) {
    return (
      <div
        className={cn(
          view === 'grid'
            ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
            : 'flex flex-col gap-2',
          className
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-2xl bg-muted"
            aria-hidden
          />
        ))}
      </div>
    )
  }

  if (safeResults.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-16',
          className
        )}
      >
        <p className="text-center text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        view === 'grid'
          ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
          : 'flex flex-col gap-2',
        className
      )}
      role="list"
      aria-label={`${total} results`}
    >
      {safeResults.map((item) => (
        <div key={item.id} role="listitem">
          <ResultCard
            item={item}
            onOpen={onOpen}
            onSave={onSave}
            onShare={onShare}
            onStar={onStar}
          />
        </div>
      ))}
    </div>
  )
}
