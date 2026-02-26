'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ReadAloudController } from './read-aloud-controller'
import { cn } from '@/lib/utils'
import type { LessonChapter, TextSizeLevel } from '@/types/study-viewer'

interface LessonPanelProps {
  lessons: LessonChapter[] | null | undefined
  onCompleteSection?: (chapterId: string) => void
  readAloudEnabled?: boolean
  textSize?: TextSizeLevel
  highContrast?: boolean
  className?: string
}

const textSizeClasses: Record<TextSizeLevel, string> = {
  normal: 'text-base',
  large: 'text-lg',
  xlarge: 'text-xl',
}

export function LessonPanel({
  lessons: lessonsProp,
  onCompleteSection,
  readAloudEnabled = false,
  textSize = 'normal',
  highContrast = false,
  className,
}: LessonPanelProps) {
  const lessons = Array.isArray(lessonsProp) ? lessonsProp : []
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [completedChapters, setCompletedChapters] = useState<Set<string>>(new Set())

  const currentChapter = lessons[currentChapterIndex] ?? null
  const total = lessons.length
  const textClass = textSizeClasses[textSize] ?? textSizeClasses.normal
  const progressPercent = total > 0 ? ((currentChapterIndex + 1) / total) * 100 : 0

  const handleComplete = useCallback(() => {
    if (!currentChapter) return
    setCompletedChapters((prev) => new Set(prev).add(currentChapter.id))
    onCompleteSection?.(currentChapter.id)
  }, [currentChapter, onCompleteSection])

  const handleNext = useCallback(() => {
    if (currentChapterIndex < total - 1) {
      setCurrentChapterIndex((i) => i + 1)
    }
  }, [currentChapterIndex, total])

  const handlePrev = useCallback(() => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex((i) => i - 1)
    }
  }, [currentChapterIndex])

  if (total === 0) {
    return (
      <Card className={cn('rounded-3xl', className)}>
        <CardContent className="flex flex-col items-center justify-center gap-4 p-12">
          <p className="text-muted-foreground">No lessons in this section.</p>
        </CardContent>
      </Card>
    )
  }

  const content = currentChapter?.content ?? ''
  const isCompleted = currentChapter ? completedChapters.has(currentChapter.id) : false

  return (
    <div className={cn('space-y-6', className)}>
      <Card
        className={cn(
          'overflow-hidden rounded-3xl border-2 transition-all duration-300',
          highContrast ? 'border-primary shadow-lg' : 'border-border shadow-card hover:shadow-card-hover'
        )}
      >
        <CardContent className="p-8">
          <div className="mb-4">
            <Progress value={progressPercent} className="h-2 rounded-full" />
            <p className="mt-1 text-xs text-muted-foreground">
              Chapter {currentChapterIndex + 1} of {total}
            </p>
          </div>

          <h3
            className={cn(
              'mb-4 text-xl font-bold text-foreground',
              highContrast && 'text-2xl'
            )}
          >
            {currentChapter?.title ?? ''}
          </h3>

          <div
            className={cn(
              'prose prose-sm max-w-none rounded-2xl bg-gradient-to-br from-[rgb(var(--peach-light))]/30 to-[rgb(var(--lavender))]/10 p-6',
              highContrast && 'bg-primary/10',
              textClass
            )}
          >
            <p className="text-foreground whitespace-pre-wrap">{content}</p>
          </div>

          {readAloudEnabled && (
            <div className="mt-4">
              <ReadAloudController text={content} />
            </div>
          )}

          <div className="mt-6 flex gap-4">
            {!isCompleted && (
              <Button
                size="lg"
                onClick={handleComplete}
                className="min-h-[48px] rounded-xl"
                aria-label="Mark as complete"
              >
                I've Read This
              </Button>
            )}
            {isCompleted && (
              <span className="flex items-center gap-2 rounded-xl bg-green-500/10 px-4 py-2 text-sm font-medium text-green-700">
                ✓ Completed
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
          disabled={currentChapterIndex === 0}
          aria-label="Previous chapter"
          className="min-h-[44px] rounded-xl"
        >
          <ChevronLeft className="h-5 w-5" />
          Previous
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          {currentChapterIndex + 1} of {total}
        </span>
        <Button
          variant="outline"
          size="lg"
          onClick={handleNext}
          disabled={currentChapterIndex >= total - 1}
          aria-label="Next chapter"
          className="min-h-[44px] rounded-xl"
        >
          Next
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
