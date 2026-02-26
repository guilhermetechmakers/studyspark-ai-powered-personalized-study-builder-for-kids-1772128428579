import { useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Snippet } from '@/types/upload-materials'
import { dataGuard } from '@/lib/data-guard'

export interface SnippetContextChipListProps {
  snippets: Snippet[]
  onRemove?: (id: string) => void
  className?: string
}

export function SnippetContextChipList({
  snippets = [],
  onRemove,
  className,
}: SnippetContextChipListProps) {
  const importantSnippets = dataGuard(snippets).filter((s) => s?.important === true)

  const handleRemove = useCallback(
    (id: string) => (e: React.MouseEvent) => {
      e.stopPropagation()
      onRemove?.(id)
    },
    [onRemove]
  )

  if (importantSnippets.length === 0) {
    return (
      <div
        className={cn(
          'rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-3',
          className
        )}
      >
        <p className="text-sm text-muted-foreground">
          No important snippets selected. Mark snippets in the OCR panel to add them as AI context.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {importantSnippets.map((snippet) => {
        const preview = (snippet.text ?? '').slice(0, 60)
        const truncated = (snippet.text?.length ?? 0) > 60 ? `${preview}…` : preview

        return (
          <div
            key={snippet.id}
            className={cn(
              'group flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5',
              'transition-all duration-200 hover:border-primary/50 hover:shadow-sm'
            )}
          >
            <span className="max-w-[200px] truncate text-sm text-foreground" title={snippet.text}>
              {truncated || '(empty)'}
            </span>
            {onRemove && (
              <button
                type="button"
                onClick={handleRemove(snippet.id)}
                className="rounded-full p-0.5 text-muted-foreground opacity-70 transition-opacity hover:bg-destructive/20 hover:text-destructive hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Remove from context"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
