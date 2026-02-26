import { GitCompare } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { BlockDiff } from '@/types/review-workflow'

export interface DiffViewerProps {
  diffs: BlockDiff[]
  className?: string
}

function DiffBlock({ diff }: { diff: BlockDiff }) {
  const { blockId, before, after, type } = diff
  const isAdded = type === 'added'
  const isRemoved = type === 'removed'
  const isModified = type === 'modified'

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-2 text-xs font-medium text-muted-foreground">Block {blockId.slice(0, 8)}...</p>
      <div className="space-y-2 font-mono text-sm">
        {(isRemoved || isModified) && (
          <div className="rounded-lg bg-destructive/10 p-2">
            <span className="text-destructive line-through">{before}</span>
          </div>
        )}
        {(isAdded || isModified) && (
          <div className="rounded-lg bg-success/10 p-2">
            <span className="text-success-foreground">{after}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function DiffViewer({ diffs, className }: DiffViewerProps) {
  const safeDiffs = Array.isArray(diffs) ? diffs : []

  if (safeDiffs.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-12',
          className
        )}
      >
        <GitCompare className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">No changes to display</p>
      </div>
    )
  }

  return (
    <ScrollArea className={cn('h-[400px]', className)}>
      <div className="space-y-4 pr-4">
        <h4 className="font-semibold text-foreground">Block-level changes</h4>
        {safeDiffs.map((d, i) => (
          <DiffBlock key={d.blockId ?? i} diff={d} />
        ))}
      </div>
    </ScrollArea>
  )
}
