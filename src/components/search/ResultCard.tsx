/**
 * ResultCard - Card for search result with title, snippet, type badge, quick actions.
 */

import { Link } from 'react-router-dom'
import { BookOpen, FileText, HelpCircle, ExternalLink, Share2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ResultItem } from '@/types/search'

export interface ResultCardProps {
  item: ResultItem
  onOpen?: (item: ResultItem) => void
  onSave?: (item: ResultItem) => void
  onShare?: (item: ResultItem) => void
  onStar?: (item: ResultItem, starred: boolean) => void
  className?: string
}

const TYPE_CONFIG = {
  study: { icon: BookOpen, label: 'Study', color: 'bg-[rgb(var(--lavender))]/20 text-[rgb(var(--violet))]' },
  material: { icon: FileText, label: 'Material', color: 'bg-[rgb(var(--tangerine))]/20 text-[rgb(var(--tangerine))]' },
  help: { icon: HelpCircle, label: 'Help', color: 'bg-[rgb(var(--peach))]/30 text-[rgb(var(--coral))]' },
}

export function ResultCard({ item, onOpen, onSave, onShare, className }: ResultCardProps) {
  const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.study
  const Icon = config.icon
  const url = item.url ?? (item.type === 'study' ? `/dashboard/studies/${item.id}` : '#')
  const tags = Array.isArray(item.tags) ? item.tags : []

  const content = (
    <Card
      className={cn(
        'group transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                    config.color
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {config.label}
                </span>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(tags ?? []).slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-foreground line-clamp-2">{item.title}</h3>
              {item.snippet && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {item.snippet}
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {item.type === 'study' && onOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault()
                    onOpen(item)
                  }}
                  aria-label="Open study"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              {onSave && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault()
                    onSave(item)
                  }}
                  aria-label="Save"
                >
                  <Star className="h-4 w-4" />
                </Button>
              )}
              {onShare && item.type !== 'help' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault()
                    onShare(item)
                  }}
                  aria-label="Share"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {item.subject && <span>{item.subject}</span>}
            {item.childAgeGroup && <span>Age {item.childAgeGroup}</span>}
            {item.style && <span>{item.style}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (onOpen) {
    return (
      <button
        type="button"
        className="block w-full text-left"
        onClick={() => onOpen(item)}
        aria-label={`Open ${item.title}`}
      >
        {content}
      </button>
    )
  }

  if (url && (url.startsWith('/') || item.type === 'help')) {
    return (
      <Link to={url} className="block">
        {content}
      </Link>
    )
  }

  if (url?.startsWith('http')) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    )
  }

  return content
}
