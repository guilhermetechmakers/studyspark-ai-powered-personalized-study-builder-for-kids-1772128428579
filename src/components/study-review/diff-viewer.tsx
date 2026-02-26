/**
 * DiffViewer - Block-level diff between versions.
 * Design: playful, rounded, pastel gradients per StudySpark design system.
 */

import { cn } from '@/lib/utils'
import type { BlockDiff } from '@/types/study-review'

export interface DiffViewerProps {
  diffs: BlockDiff[]
  className?: string
}

export function DiffViewer({ diffs, className }: DiffViewerProps) {
  const safeDiffs = Array.isArray(diffs) ? diffs : []

  if (safeDiffs.length === 0) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center',
          className
        )}
      >
        <p className="text-sm text-muted-foreground">No changes to display</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'space-y-4 rounded-2xl border-2 border-border bg-card p-4',
        'animate-fade-in',
        className
      )}
      role="region"
      aria-label="Version diff"
    >
      {safeDiffs.map((diff, i) => {
        const dt = diff.type ?? 'modified'
        return (
          <div
            key={`${diff.blockId}-${i}`}
            className={cn(
              'rounded-xl border p-4 font-mono text-sm',
              dt === 'added' && 'border-green-500/30 bg-green-500/5',
              dt === 'removed' && 'border-destructive/30 bg-destructive/5',
              dt === 'modified' && 'border-primary/30 bg-primary/5',
              dt === 'unchanged' && 'border-border bg-muted/20'
            )}
          >
            <span className="mb-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium uppercase">
              {dt}
            </span>
            {dt !== 'added' && diff.before && (
              <div className="mb-2">
                <p className="text-xs font-medium text-muted-foreground">Before:</p>
                <p className={cn(
                  'whitespace-pre-wrap break-words',
                  (dt === 'removed' || dt === 'modified') && 'line-through text-destructive/80'
                )}>
                  {diff.before}
                </p>
              </div>
            )}
            {dt !== 'removed' && diff.after && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">After:</p>
                <p className={cn(
                  'whitespace-pre-wrap break-words',
                  (dt === 'added' || dt === 'modified') && 'text-green-700 dark:text-green-400'
                )}>
                  {diff.after}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
