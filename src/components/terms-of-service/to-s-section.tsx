/**
 * ToSSection - Reusable section component for Terms of Service.
 * Renders headers, paragraphs, and lists from structured content.
 */
import type { ToSSection as ToSSectionType, ToSBlock } from '@/types/terms-of-service'
import { cn } from '@/lib/utils'

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
        <h3 key={index} className="mt-4 mb-2 text-base font-semibold text-foreground">
          {block.text}
        </h3>
      ) : null
    case 'ul': {
      const items = Array.isArray(block.items) ? block.items : []
      if (items.length === 0) return null
      return (
        <ul key={index} className="mt-2 ml-4 list-disc space-y-1 text-muted-foreground">
          {items.map((item, i) => (
            <li key={i} className="leading-relaxed">{item}</li>
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
            <li key={i} className="leading-relaxed">{item}</li>
          ))}
        </ol>
      )
    }
    default:
      return null
  }
}

export interface ToSSectionProps {
  section: ToSSectionType
  className?: string
}

export function ToSSection({ section, className }: ToSSectionProps) {
  if (!section || typeof section !== 'object') return null

  const id = section.id ?? `section-${Math.random().toString(36).slice(2)}`
  const blocks = Array.isArray(section.blocks) ? section.blocks : []
  const subsections = Array.isArray(section.subsections) ? section.subsections : []

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn('scroll-mt-24', className)}
    >
      <h2 id={`${id}-heading`} className="text-xl font-bold text-foreground mb-4">
        {section.title ?? 'Untitled'}
      </h2>
      <div className="space-y-3">
        {blocks.map((block, idx) => renderBlock(block, idx))}
      </div>
      {subsections.length > 0 && (
        <div className="mt-6 ml-4 space-y-6 border-l-2 border-border pl-6">
          {subsections.map((sub) => (
            <ToSSection key={sub.id ?? sub.title} section={sub} />
          ))}
        </div>
      )}
    </section>
  )
}
