import { Link } from 'react-router-dom'
import { Sparkles, Bookmark, Eye, Play } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Recommendation } from '@/types/dashboard'
import { dataGuard } from '@/lib/data-guard'
import { toast } from 'sonner'

export interface RecommendedStudiesCarouselProps {
  recommendations: Recommendation[]
  isLoading?: boolean
  onSave?: (rec: Recommendation) => void
  onView?: (rec: Recommendation) => void
  onStart?: (rec: Recommendation) => void
  className?: string
}

export function RecommendedStudiesCarousel({
  recommendations,
  isLoading = false,
  onSave,
  onView,
  onStart,
  className,
}: RecommendedStudiesCarouselProps) {
  const safeRecs = dataGuard(recommendations)

  const handleSave = (rec: Recommendation) => {
    onSave?.(rec)
    toast.success(`"${rec.topic}" saved to your studies`)
  }

  const handleView = (rec: Recommendation) => {
    onView?.(rec)
  }

  const handleStart = (rec: Recommendation) => {
    onStart?.(rec)
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="h-6 w-40 animate-pulse rounded bg-muted" />
          <div className="mt-1 h-4 w-56 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 min-w-[280px] animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (safeRecs.length === 0) {
    return (
      <Card
        className={cn(
          'border-dashed border-2 border-border bg-gradient-to-br from-[rgb(var(--lavender))]/10 to-[rgb(var(--tangerine))]/10',
          className
        )}
      >
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-foreground">No recommendations yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload teacher materials or add upcoming tests to get AI suggestions.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/dashboard/create">Create Study</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recommended for you</h3>
          <p className="text-sm text-muted-foreground">
            AI suggestions based on your materials
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="-mx-1 overflow-x-auto pb-4 scrollbar-thin">
          <div className="flex gap-4 px-1">
            {safeRecs.map((rec) => (
              <Card
                key={rec.id}
                className="min-w-[280px] max-w-[280px] shrink-0 overflow-hidden border-2 border-transparent bg-gradient-to-br from-[rgb(var(--peach-light))]/30 to-[rgb(var(--lavender))]/20 transition-all duration-300 hover:border-primary/30 hover:shadow-card-hover hover:-translate-y-0.5"
              >
                <CardContent className="p-0">
                  <div className="p-4">
                    <h4 className="font-semibold text-foreground">{rec.topic}</h4>
                    {rec.notes && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {rec.notes}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {Math.round(rec.confidence * 100)}% match
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 border-t border-border p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 rounded-full text-xs"
                      onClick={() => handleSave(rec)}
                    >
                      <Bookmark className="mr-1 h-3.5 w-3.5" />
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 rounded-full text-xs"
                      onClick={() => handleView(rec)}
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      View
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 rounded-full text-xs"
                      onClick={() => handleStart(rec)}
                      asChild
                    >
                      <Link to="/dashboard/create">
                        <Play className="mr-1 h-3.5 w-3.5" />
                        Start
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
