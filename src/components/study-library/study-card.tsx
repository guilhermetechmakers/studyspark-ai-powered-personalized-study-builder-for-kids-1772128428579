/**
 * StudyCard - Single study card with thumbnail, title, tags, actions.
 */

import { Link } from 'react-router-dom'
import {
  FolderOpen,
  MoreVertical,
  ExternalLink,
  Copy,
  Download,
  Share2,
  Trash2,
  Star,
  Play,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { StudyCardType } from '@/types/study-library'

export interface StudyCardProps {
  study: StudyCardType
  view: 'grid' | 'list'
  selected?: boolean
  onSelectChange?: (selected: boolean) => void
  onDuplicate?: (id: string) => void
  onExport?: (id: string) => void
  onShare?: (id: string) => void
  onDelete?: (id: string) => void
  onStarToggle?: (id: string, starred: boolean) => void
  onDragStart?: (id: string) => void
  onDragEnd?: () => void
  className?: string
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return d.toLocaleDateString()
  } catch {
    return ''
  }
}

export function StudyCard({
  study,
  view,
  selected = false,
  onSelectChange,
  onDuplicate,
  onExport,
  onShare,
  onDelete,
  onStarToggle,
  onDragStart,
  onDragEnd,
  className,
}: StudyCardProps) {
  const tags = study.tags ?? []
  const subject = study.subject ?? ''
  const learningStyle = study.learningStyle ?? ''
  const childName = study.childName ?? ''
  const lastModified = formatDate(study.lastModified ?? '')
  const isStarred = study.isStarred ?? false

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('study-id', study.id)
    e.dataTransfer.effectAllowed = 'move'
    onDragStart?.(study.id)
  }

  const handleDragEnd = () => {
    onDragEnd?.()
  }

  return (
    <Card
      className={cn(
        'group transition-all duration-200 hover:shadow-card-hover',
        selected && 'ring-2 ring-primary',
        view === 'list' && 'flex flex-row',
        className
      )}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CardContent
        className={cn(
          'p-0',
          view === 'grid' ? 'p-6' : 'flex flex-1 items-center gap-4 p-4'
        )}
      >
        {view === 'grid' && (
          <Link
            to={`/dashboard/studies/${study.id}`}
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
          >
            <div className="mb-4 flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[rgb(var(--peach-light))] to-[rgb(var(--lavender))]/30">
              {study.thumbnailUrl ? (
                <img
                  src={study.thumbnailUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <FolderOpen className="h-12 w-12 text-primary/60" />
              )}
            </div>
          </Link>
        )}

        <div className={cn('flex-1 min-w-0', view === 'list' && 'flex items-center gap-4')}>
          {view === 'list' && (
            <>
              {onSelectChange && (
                <Checkbox
                  checked={selected}
                  onCheckedChange={(c) => onSelectChange(!!c)}
                  aria-label={`Select ${study.title}`}
                />
              )}
              <Link
                to={`/dashboard/studies/${study.id}`}
                className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[rgb(var(--peach-light))] to-[rgb(var(--lavender))]/30"
              >
                {study.thumbnailUrl ? (
                  <img
                    src={study.thumbnailUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FolderOpen className="h-6 w-6 text-primary/60" />
                )}
              </Link>
            </>
          )}

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {view === 'grid' && onSelectChange && (
                <div className="mb-2">
                  <Checkbox
                    checked={selected}
                    onCheckedChange={(c) => onSelectChange(!!c)}
                    aria-label={`Select ${study.title}`}
                  />
                </div>
              )}
              <Link to={`/dashboard/studies/${study.id}`}>
                <h3 className="font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
                  {study.title}
                </h3>
              </Link>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {subject && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {subject}
                  </span>
                )}
                {learningStyle && (
                  <span className="inline-flex items-center rounded-full bg-secondary/20 px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                    {learningStyle}
                  </span>
                )}
              </div>
              {(childName || lastModified) && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {[childName, lastModified].filter(Boolean).join(' · ')}
                </p>
              )}
              {tags.length > 0 && view === 'grid' && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {(tags ?? []).slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {onStarToggle && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onStarToggle(study.id, !isStarred)}
                  aria-label={isStarred ? 'Unstar' : 'Star'}
                >
                  <Star
                    className={cn('h-4 w-4', isStarred && 'fill-accent text-accent')}
                  />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to={`/study/${study.id}/play`}>
                      <Play className="mr-2 h-4 w-4" />
                      Play (Study Viewer)
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/dashboard/studies/${study.id}`}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open
                    </Link>
                  </DropdownMenuItem>
                  {onDuplicate && (
                    <DropdownMenuItem onClick={() => onDuplicate(study.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                  )}
                  {onExport && (
                    <DropdownMenuItem onClick={() => onExport(study.id)}>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </DropdownMenuItem>
                  )}
                  {onShare && (
                    <DropdownMenuItem onClick={() => onShare(study.id)}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(study.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
