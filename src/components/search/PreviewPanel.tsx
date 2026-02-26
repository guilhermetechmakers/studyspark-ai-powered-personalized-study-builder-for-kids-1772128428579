/**
 * PreviewPanel - Quick view modal/sheet for search result with actions.
 */

import { Link } from 'react-router-dom'
import { BookOpen, FileText, HelpCircle, ExternalLink, Share2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { ResultItem } from '@/types/search'

export interface PreviewPanelProps {
  item: ResultItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (item: ResultItem) => void
  onApprove?: (item: ResultItem) => void
  onRequestChanges?: (item: ResultItem) => void
  onSave?: (item: ResultItem) => void
  onShare?: (item: ResultItem) => void
}

const TYPE_CONFIG = {
  study: { icon: BookOpen, label: 'Study' },
  material: { icon: FileText, label: 'Material' },
  help: { icon: HelpCircle, label: 'Help' },
}

export function PreviewPanel({
  item,
  open,
  onOpenChange,
  onEdit,
  onApprove,
  onRequestChanges,
  onSave,
  onShare,
}: PreviewPanelProps) {
  if (!item) return null

  const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.study
  const Icon = config.icon
  const url = item.url ?? (item.type === 'study' ? `/dashboard/studies/${item.id}` : '#')

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-lg"
        aria-label="Result preview"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                item.type === 'study' && 'bg-[rgb(var(--lavender))]/20 text-[rgb(var(--violet))]',
                item.type === 'material' && 'bg-[rgb(var(--tangerine))]/20 text-[rgb(var(--tangerine))]',
                item.type === 'help' && 'bg-[rgb(var(--peach))]/30 text-[rgb(var(--coral))]'
              )}
            >
              <Icon className="h-3 w-3" />
              {config.label}
            </span>
            {item.title}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {item.snippet && (
            <p className="text-sm text-muted-foreground">{item.snippet}</p>
          )}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {item.subject && <span>Subject: {item.subject}</span>}
            {item.childAgeGroup && <span>Age: {item.childAgeGroup}</span>}
            {item.style && <span>Style: {item.style}</span>}
          </div>
          {Array.isArray(item.tags) && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-muted px-2.5 py-0.5 text-xs"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {url && (
            <Button asChild variant="default" className="rounded-full">
              <Link to={url} onClick={() => onOpenChange(false)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open
              </Link>
            </Button>
          )}
          {item.type === 'study' && onEdit && (
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                onEdit(item)
                onOpenChange(false)
              }}
            >
              Edit
            </Button>
          )}
          {item.type === 'study' && onApprove && (
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => onApprove(item)}
            >
              Approve
            </Button>
          )}
          {item.type === 'study' && onRequestChanges && (
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => onRequestChanges(item)}
            >
              Request changes
            </Button>
          )}
          {onSave && (
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => onSave(item)}
              aria-label="Save"
            >
              <Star className="h-4 w-4" />
            </Button>
          )}
          {onShare && item.type !== 'help' && (
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => onShare(item)}
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
