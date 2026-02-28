import { Link } from 'react-router-dom'
import {
  BookOpen,
  Copy,
  Share2,
  Download,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import type { Study } from '@/types/dashboard'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<Study['status'], string> = {
  saved: 'Saved',
  completed: 'Completed',
  'in-progress': 'In Progress',
}

const STATUS_COLORS: Record<Study['status'], string> = {
  saved: 'bg-primary/10 text-primary',
  completed: 'bg-green-500/10 text-green-600',
  'in-progress': 'bg-[rgb(var(--tangerine))]/20 text-[rgb(var(--tangerine))]',
}

interface RecentStudiesListProps {
  studies: Study[]
  isLoading?: boolean
  onOpen?: (study: Study) => void
  onDuplicate?: (study: Study) => void
  onShare?: (study: Study) => void
  onExport?: (study: Study) => void
}

export function RecentStudiesList({
  studies,
  isLoading = false,
  onOpen,
  onDuplicate,
  onShare,
  onExport,
}: RecentStudiesListProps) {
  const list = Array.isArray(studies) ? studies : []

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
      <Card data-testid="dashboard-studies" aria-busy="true" aria-label="Recent studies">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (list.length === 0) {
    return (
      <Card
        data-testid="dashboard-studies"
        className="border-dashed border-2"
        aria-live="polite"
      >
        <CardContent
          data-testid="empty-studies"
          className="flex flex-col items-center justify-center gap-4 py-12"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-foreground">No studies found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first study to get started.
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/create">Create Study</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-testid="dashboard-studies" aria-live="polite">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Studies</CardTitle>
          <CardDescription>Your latest study sets</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard/studies">View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {list.map((study) => (
            <div
              key={study.id}
              className="group flex items-center justify-between gap-4 rounded-xl border border-border p-4 transition-all duration-200 hover:bg-muted/50 hover:shadow-sm"
            >
              <Link
                to={`/dashboard/studies/${study.id}`}
                className="min-w-0 flex-1"
                onClick={() => onOpen?.(study)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{study.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                          STATUS_COLORS[study.status]
                        )}
                      >
                        {STATUS_LABELS[study.status]}
                      </span>
                      <span className="text-sm text-muted-foreground">{study.updatedAt}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    aria-label="Study actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/dashboard/studies/${study.id}`}>Open</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDuplicate(study)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare(study)}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport(study)}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
