'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, BookOpen, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface LessonItem {
  id: string
  title: string
  body: string
}

interface GamifiedLessonsTabProps {
  lessons: LessonItem[]
  themeRgb?: { primary: string; secondary: string }
  className?: string
}

export function GamifiedLessonsTab({
  lessons,
  themeRgb,
  className,
}: GamifiedLessonsTabProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  const primary = themeRgb?.primary ?? '91 87 165'
  const secondary = themeRgb?.secondary ?? '169 166 249'
  const list = Array.isArray(lessons) ? lessons : []
  const current = list[currentIndex] ?? null
  const progressPercent =
    list.length > 0 ? ((currentIndex + 1) / list.length) * 100 : 0

  const handleComplete = useCallback(() => {
    if (current) setCompleted((c) => new Set(c).add(current.id))
  }, [current])

  const handleNext = useCallback(() => {
    if (currentIndex < list.length - 1) setCurrentIndex((i) => i + 1)
  }, [currentIndex, list.length])

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }, [currentIndex])

  if (list.length === 0) {
    return (
      <Card className={cn('rounded-3xl', className)}>
        <CardContent className="flex flex-col items-center justify-center gap-4 p-12">
          <BookOpen className="h-12 w-12 text-muted-foreground" aria-hidden />
          <p className="text-muted-foreground">No lessons in this study yet.</p>
        </CardContent>
      </Card>
    )
  }

  const isCompleted = current ? completed.has(current.id) : false

  return (
    <div className={cn('space-y-6', className)}>
      <div className="animate-fade-in">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Lesson {currentIndex + 1} of {list.length}
          </span>
          <span
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: `rgb(${primary} / 0.15)`,
              color: `rgb(${primary})`,
            }}
          >
            {Math.round(progressPercent)}% complete
          </span>
        </div>
        <Progress
          value={progressPercent}
          className="h-2"
          style={
            {
              '--progress-background': `rgb(${primary})`,
            } as React.CSSProperties
          }
        />
      </div>

      <Card
        className={cn(
          'overflow-hidden rounded-3xl border-2 transition-all duration-300',
          'hover:shadow-card-hover',
          'animate-fade-in'
        )}
        style={{
          borderColor: `rgb(${primary} / 0.3)`,
          boxShadow: `0 4px 20px rgb(${primary} / 0.08)`,
        }}
      >
        <CardContent className="p-6 sm:p-8">
          <h3 className="mb-4 text-xl font-bold text-foreground">
            {current?.title ?? ''}
          </h3>
          <div
            className="rounded-2xl p-6"
            style={{
              background: `linear-gradient(135deg, rgb(${secondary} / 0.2), rgb(${primary} / 0.06))`,
            }}
          >
            <p className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
              {current?.body ?? ''}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            {!isCompleted && (
              <Button
                size="lg"
                onClick={handleComplete}
                className="min-h-[48px] gap-2 rounded-xl"
                style={{
                  backgroundColor: `rgb(${primary})`,
                  color: 'white',
                }}
              >
                <Check className="h-5 w-5" aria-hidden />
                I&apos;ve Read This
              </Button>
            )}
            {isCompleted && (
              <span
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
                style={{
                  backgroundColor: `rgb(34 197 94 / 0.15)`,
                  color: 'rgb(22 101 52)',
                }}
              >
                <Check className="h-5 w-5" aria-hidden />
                Completed
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="min-h-[44px] rounded-xl"
          aria-label="Previous lesson"
        >
          <ChevronLeft className="h-5 w-5" />
          Previous
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          {currentIndex + 1} / {list.length}
        </span>
        <Button
          variant="outline"
          size="lg"
          onClick={handleNext}
          disabled={currentIndex >= list.length - 1}
          className="min-h-[44px] rounded-xl"
          aria-label="Next lesson"
        >
          Next
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
