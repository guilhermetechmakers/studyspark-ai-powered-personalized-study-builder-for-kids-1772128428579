/**
 * BulkActionToolbar - Bulk select, actions, and confirmation for admin queues.
 */

import { MousePointerClick } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface BulkActionToolbarProps {
  selectedCount: number
  onClearSelection: () => void
  actions: Array<{
    label: string
    icon?: React.ReactNode
    variant?: 'default' | 'destructive' | 'outline'
    onClick: () => void
    disabled?: boolean
  }>
  /** Optional: hide empty state when no items selected. Default: false (show empty state). */
  hideEmptyState?: boolean
  className?: string
}

export function BulkActionToolbar({
  selectedCount,
  onClearSelection,
  actions,
  hideEmptyState = false,
  className,
}: BulkActionToolbarProps) {
  const isEmpty = selectedCount === 0

  if (isEmpty && hideEmptyState) return null

  if (isEmpty) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Bulk actions: select items to enable"
        className={cn(
          'flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-muted/30 px-4 py-3 sm:gap-4',
          'animate-fade-in transition-colors duration-200',
          className
        )}
      >
        <div className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-primary/5 text-primary">
          <MousePointerClick className="h-5 w-5 shrink-0" aria-hidden />
        </div>
        <div className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
          <p className="text-sm font-medium text-foreground">
            Select items to perform bulk actions
          </p>
          <p className="text-xs text-muted-foreground">
            Use the checkboxes in the table to select one or more items.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      role="toolbar"
      aria-label={`${selectedCount} items selected for bulk actions`}
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-muted/30 px-4 py-3 sm:gap-4',
        'animate-fade-in transition-colors duration-200',
        className
      )}
    >
      <span className="text-sm font-medium">{selectedCount} selected</span>
      {(actions ?? []).map((a, i) => (
        <Button
          key={i}
          variant={a.variant ?? 'outline'}
          size="sm"
          className="gap-2"
          onClick={a.onClick}
          disabled={a.disabled}
        >
          {a.icon}
          {a.label}
        </Button>
      ))}
      <Button variant="ghost" size="sm" onClick={onClearSelection}>
        Clear selection
      </Button>
    </div>
  )
}
