/**
 * EmptyState - Shown when Study Library has no studies.
 * Helpful copy and CTA to create first study.
 */

import { Link } from 'react-router-dom'
import { FolderOpen, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  className?: string
  /** Optional: show different message when filters are active */
  hasActiveFilters?: boolean
  onClearFilters?: () => void
}

export function EmptyState({
  className,
  hasActiveFilters,
  onClearFilters,
}: EmptyStateProps) {
  return (
    <Card
      className={cn(
        'border-dashed',
        className
      )}
      data-testid="study-library-empty-state"
    >
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(var(--peach-light))] to-[rgb(var(--lavender))]/30">
          <FolderOpen className="h-8 w-8 text-primary" aria-hidden />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          {hasActiveFilters ? 'No studies match your filters' : 'No studies yet'}
        </h3>
        <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
          {hasActiveFilters ? (
            <>
              Try adjusting or clearing your filters to see more studies.
            </>
          ) : (
            <>
              Create your first study set to get started. Upload teacher
              materials and let AI generate personalized content.
            </>
          )}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {hasActiveFilters && onClearFilters ? (
            <Button variant="outline" onClick={onClearFilters}>
              Clear filters
            </Button>
          ) : null}
          {!hasActiveFilters && (
            <Button asChild>
              <Link to="/dashboard/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Study
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
