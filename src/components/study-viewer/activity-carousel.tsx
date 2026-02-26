'use client'

import { ChevronLeft, ChevronRight, Layers, HelpCircle, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { Activity, ActivityType } from '@/types/study-viewer'

interface ActivityCarouselProps {
  activities: Activity[] | null | undefined
  currentIndex: number
  onChangeIndex: (index: number) => void
  className?: string
}

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  flashcard: <Layers className="h-6 w-6" />,
  quiz: <HelpCircle className="h-6 w-6" />,
  lesson: <BookOpen className="h-6 w-6" />,
}

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  flashcard: 'Flashcards',
  quiz: 'Quiz',
  lesson: 'Lesson',
}

export function ActivityCarousel({
  activities: activitiesProp,
  currentIndex,
  onChangeIndex,
  className,
}: ActivityCarouselProps) {
  const activities = Array.isArray(activitiesProp) ? activitiesProp : []
  const total = activities.length
  const progressPercent = total > 0 ? ((currentIndex + 1) / total) * 100 : 0

  if (total === 0) return null

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onChangeIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          aria-label="Previous activity"
          className="h-12 w-12 shrink-0 rounded-xl"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div className="flex flex-1 flex-wrap items-center justify-center gap-2">
          {(activities ?? []).map((activity, i) => {
            const isActive = i === currentIndex
            const type = (activity?.type ?? 'flashcard') as ActivityType
            return (
              <button
                key={activity?.id ?? i}
                type="button"
                onClick={() => onChangeIndex(i)}
                className={cn(
                  'flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl px-4 transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                )}
                aria-current={isActive ? 'true' : undefined}
                aria-label={`${ACTIVITY_LABELS[type]} ${i + 1}`}
              >
                {ACTIVITY_ICONS[type]}
                <span className="hidden sm:inline">{ACTIVITY_LABELS[type]}</span>
              </button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onChangeIndex(Math.min(total - 1, currentIndex + 1))}
          disabled={currentIndex >= total - 1}
          aria-label="Next activity"
          className="h-12 w-12 shrink-0 rounded-xl"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      <div className="px-2">
        <Progress value={progressPercent} className="h-2 rounded-full" />
        <p className="mt-1 text-center text-xs text-muted-foreground">
          {currentIndex + 1} of {total} activities
        </p>
      </div>
    </div>
  )
}
