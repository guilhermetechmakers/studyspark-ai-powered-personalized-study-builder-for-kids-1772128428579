/**
 * Pagination - Page numbers, next/prev, loading indicator.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface PaginationProps {
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  className?: string
}

export function Pagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  isLoading = false,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil((totalCount ?? 0) / (pageSize || 1)))
  const start = ((page ?? 1) - 1) * (pageSize ?? 1)
  const end = Math.min(start + (pageSize ?? 1), totalCount ?? 0)
  const hasPrev = page > 1
  const hasNext = page < totalPages

  if (totalCount <= pageSize) return null

  const pageNumbers: number[] = []
  const showPages = 5
  let low = Math.max(1, page - Math.floor(showPages / 2))
  let high = Math.min(totalPages, low + showPages - 1)
  if (high - low + 1 < showPages) {
    low = Math.max(1, high - showPages + 1)
  }
  for (let i = low; i <= high; i++) {
    pageNumbers.push(i)
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-2 py-4',
        className
      )}
      role="navigation"
      aria-label="Pagination"
    >
      <p className="text-sm text-muted-foreground">
        Showing {start + 1}–{end} of {totalCount}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev || isLoading}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pageNumbers.map((n) => (
          <Button
            key={n}
            variant={n === page ? 'default' : 'outline'}
            size="icon"
            className="h-9 w-9"
            onClick={() => onPageChange(n)}
            disabled={isLoading}
            aria-label={`Page ${n}`}
            aria-current={n === page ? 'page' : undefined}
          >
            {n}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext || isLoading}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
