import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Bookmark, Eye, Play, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { Recommendation } from '@/types/dashboard'

interface RecommendedStudiesCarouselProps {
  recommendations: Recommendation[]
  isLoading?: boolean
  onSave?: (rec: Recommendation) => void
  onView?: (rec: Recommendation) => void
  onStart?: (rec: Recommendation) => void
}

export function RecommendedStudiesCarousel({
  recommendations,
  isLoading = false,
  onSave,
  onView,
  onStart,
}: RecommendedStudiesCarouselProps) {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)

  const list = Array.isArray(recommendations) ? recommendations : []

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 280
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const handleSave = (rec: Recommendation) => {
    onSave?.(rec)
    toast.success(`"${rec.topic}" saved to your studies`)
  }

  const handleStart = (rec: Recommendation) => {
    onStart?.(rec)
    navigate('/dashboard/create')
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 w-64 shrink-0 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (list.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-[rgb(var(--lavender))]/10 to-[rgb(var(--tangerine))]/10">
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
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Recommended Studies
          </CardTitle>
          <CardDescription>AI suggestions based on your materials</CardDescription>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {list.map((rec) => (
            <div
              key={rec.id}
              className="flex w-64 shrink-0 flex-col rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-card-hover"
            >
              <h4 className="font-semibold text-foreground">{rec.topic}</h4>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {Math.round((rec.confidence ?? 0) * 100)}% match
                </span>
              </div>
              {rec.notes && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{rec.notes}</p>
              )}
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => handleSave(rec)}
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => onView?.(rec)}
                  aria-label={`View ${rec.topic}`}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1"
                  onClick={() => handleStart(rec)}
                >
                  <Play className="h-3.5 w-3.5" />
                  Start
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
