/**
 * BulkActionToolbar - Bulk select, actions, and confirmation for admin queues.
 */

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
  className?: string
}

export function BulkActionToolbar({
  selectedCount,
  onClearSelection,
  actions,
  className,
}: BulkActionToolbarProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-muted/30 px-4 py-3',
        className
      )}
    >
      <span className="text-sm font-medium">{selectedCount} selected</span>
      {actions.map((a, i) => (
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
