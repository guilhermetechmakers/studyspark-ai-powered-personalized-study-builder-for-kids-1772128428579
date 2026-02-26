/**
 * ToSContentRenderer - Renders rich-text-like structured content safely.
 * Guards all data access with data ?? [] and Array.isArray checks.
 */
import type { ToSBlock, ToSSection } from '@/types/terms-of-service'
import { cn } from '@/lib/utils'

export interface ToSContentRendererProps {
  sections: ToSSection[]
  className?: string
}

function renderBlock(block: ToSBlock, index: number) {
  if (!block || typeof block !== 'object') return null

  switch (block.type) {
    case 'p':
      return block.text ? (
        <p key={index} className="text-base text-muted-foreground leading-relaxed">
          {block.text}
        </p>
      ) : null
    case 'h3':
      return block.text ? (
        <h3
          key={index}
          className="mt-4 mb-2 text-base font-semibold text-foreground"
        >
          {block.text}
        </h3>
      ) : null
    case 'ul': {
      const items = Array.isArray(block.items) ? block.items : []
      if (items.length === 0) return null
      return (
        <ul key={index} className="mt-2 ml-4 list-disc space-y-1 text-muted-foreground">
          {items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      )
    }
    case 'ol': {
      const items = Array.isArray(block.items) ? block.items : []
      if (items.length === 0) return null
      return (
        <ol key={index} className="mt-2 ml-4 list-decimal space-y-1 text-muted-foreground">
          {items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ol>
      )
    }
    default:
      return null
  }
}

export function ToSContentRenderer({ sections, className }: ToSContentRendererProps) {
  const safeSections = Array.isArray(sections) ? sections : []

  if (safeSections.length === 0) {
    return (
      <p className="text-muted-foreground" role="status">
        No content available.
      </p>
    )
  }

  return (
    <div className={cn('space-y-8', className)}>
      {safeSections.map((section) => {
        const blocks = Array.isArray(section?.blocks) ? section.blocks : []
        const id = section?.id ?? `section-${Math.random().toString(36).slice(2)}`

        return (
          <section
            key={id}
            id={id}
            aria-labelledby={`${id}-heading`}
            className="scroll-mt-24 rounded-[20px] border border-border/60 bg-gradient-to-br from-[rgb(var(--peach-light))]/40 via-white to-[rgb(var(--lavender))]/20 p-6 md:p-8 shadow-card transition-all duration-300 hover:shadow-card-hover"
          >
            <h2
              id={`${id}-heading`}
              className="text-xl font-bold text-foreground mb-4 md:text-2xl"
            >
              {section?.title ?? 'Untitled'}
            </h2>
            <div className="space-y-3">
              {blocks.map((block, idx) => renderBlock(block, idx))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
