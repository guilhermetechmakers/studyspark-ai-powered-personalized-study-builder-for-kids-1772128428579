/**
 * TagPill - Rounded pill with optional color for tags.
 * Design: pill-shaped, pastel backgrounds, 20-28px radius.
 */

import { cn } from '@/lib/utils'
import type { TagType } from '@/types/study-library'

const TAG_COLORS: Record<string, string> = {
  default: 'bg-primary/10 text-primary',
  lavender: 'bg-[rgb(var(--lavender))]/20 text-[rgb(var(--violet))]',
  peach: 'bg-[rgb(var(--peach-light))] text-[rgb(var(--tangerine))]',
  coral: 'bg-[rgb(var(--coral))]/30 text-[rgb(var(--coral))]',
  yellow: 'bg-[rgb(var(--warning))]/30 text-[rgb(var(--warning-foreground))]',
}

export interface TagPillProps {
  tag: TagType | string
  onClick?: () => void
  onRemove?: () => void
  selected?: boolean
  className?: string
}

function getTagDisplay(tag: TagType | string): { name: string; colorClass?: string } {
  if (typeof tag === 'string') {
    return { name: tag }
  }
  const colorKey = tag.color && TAG_COLORS[tag.color] ? tag.color : 'default'
  return {
    name: tag.name,
    colorClass: TAG_COLORS[colorKey] ?? TAG_COLORS.default,
  }
}

export function TagPill({
  tag,
  onClick,
  onRemove,
  selected = false,
  className,
}: TagPillProps) {
  const { name, colorClass } = getTagDisplay(tag)
  const isObject = typeof tag !== 'string'
  const hasColor = isObject && (tag as TagType).color

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200',
        'hover:shadow-sm',
        colorClass ?? 'bg-muted text-muted-foreground',
        selected && 'ring-2 ring-primary ring-offset-2',
        onClick && 'cursor-pointer',
        className
      )}
      style={hasColor && (tag as TagType).color?.startsWith('#')
        ? { backgroundColor: `${(tag as TagType).color}20`, color: (tag as TagType).color }
        : undefined}
      role={onClick ? 'button' : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      tabIndex={onClick ? 0 : undefined}
      aria-label={onRemove ? `Remove tag ${name}` : undefined}
    >
      {name}
      {onRemove && (
        <button
          type="button"
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          aria-label={`Remove ${name}`}
        >
          <span className="text-[10px] leading-none">×</span>
        </button>
      )}
    </span>
  )
}
