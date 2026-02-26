/**
 * TagFilterChips - Pill-shaped tag filters for the library.
 * Click to toggle filter; supports multiple selection.
 */

import { Tag, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TagType } from '@/types/study-library'

export interface TagFilterChipsProps {
  tags: TagType[]
  selectedTagIds: string[]
  onToggle: (tagId: string) => void
  onClearAll?: () => void
  className?: string
}

export function TagFilterChips({
  tags,
  selectedTagIds,
  onToggle,
  onClearAll,
  className,
}: TagFilterChipsProps) {
  const tagList = tags ?? []
  const selectedSet = new Set(selectedTagIds ?? [])
  const hasSelection = selectedSet.size > 0

  if (tagList.length === 0) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Tag className="h-4 w-4" />
        Tags
      </span>
      {tagList.map((tag) => {
        const isSelected = selectedSet.has(tag.id)
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onToggle(tag.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all',
              'hover:scale-[1.02] hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isSelected
                ? 'ring-2 ring-primary/60 shadow-sm'
                : 'bg-muted/60 hover:bg-muted'
            )}
            style={
              isSelected
                ? {
                    backgroundColor: (tag.color ?? '#A9A6F9') + '50',
                    color: 'rgb(var(--foreground))',
                  }
                : undefined
            }
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: tag.color ?? '#A9A6F9' }}
            />
            {tag.name}
          </button>
        )
      })}
      {hasSelection && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  )
}
