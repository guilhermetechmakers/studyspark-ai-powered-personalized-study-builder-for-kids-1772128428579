import { Link } from 'react-router-dom'
import {
  BookOpen,
  Copy,
  Share2,
  Download,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Study } from '@/types/dashboard'
import { dataGuard } from '@/lib/data-guard'
import { toast } from 'sonner'

export interface RecentStudiesListProps {
  studies: Study[]
  isLoading?: boolean
  onOpen?: (study: Study) => void
  onDuplicate?: (study: Study) => void
  onShare?: (study: Study) => void
  onExport?: (study: Study) => void
  className?: string
}

export function RecentStudiesList({
  studies,
  isLoading = false,
  onOpen,
  onDuplicate,
  onShare,
  onExport,
  className,
}: RecentStudiesListProps) {
  const safeStudies = dataGuard(studies)

  const handleOpen = (study: Study) => {
    onOpen?.(study)
  }

  const handleDuplicate = (study: Study) => {
    onDuplicate?.(study)
    toast.success(`"${study.title}" duplicated`)
  }

  const handleShare = (study: Study) => {
    onShare?.(study)
    toast.success(`Share link copied for "${study.title}"`)
  }

  const handleExport = (study: Study) => {
    onExport?.(study)
    toast.success(`Exporting "${study.title}"...`)
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-1 h-4 w-48 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (safeStudies.length === 0) {
    return (
      <Card
        className={cn(
          'border-dashed border-2 border-border bg-gradient-to-br from-[rgb(var(--lavender))]/10 to-transparent',
          className
        )}
      >
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-foreground">No studies yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first study to get started.
            </p>
          </div>
          <Button asChild className="rounded-full">
            <Link to="/dashboard/create">
              Create Study
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Studies</h3>
          <p className="text-sm text-muted-foreground">Your latest study sets</p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard/studies" className="rounded-full">
            View all
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3" role="list">
          {safeStudies.map((study) => (
            <li
              key={study.id}
              className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <Link
                to={`/dashboard/studies/${study.id}`}
                className="min-w-0 flex-1"
              >
                <p className="font-medium text-foreground truncate">{study.title}</p>
                <p className="text-sm text-muted-foreground">
                  {study.updatedAt} · {study.status}
                </p>
              </Link>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => handleOpen(study)}
                  aria-label={`Open ${study.title}`}
                  asChild
                >
                  <Link to={`/dashboard/studies/${study.id}`}>
                    <BookOpen className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => handleDuplicate(study)}
                  aria-label={`Duplicate ${study.title}`}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => handleShare(study)}
                  aria-label={`Share ${study.title}`}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => handleExport(study)}
                  aria-label={`Export ${study.title}`}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
