'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, BookOpen, Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const [completed, setCompleted]       = useState<Set<string>>(new Set())

  const primary   = themeRgb?.primary   ?? '91 87 165'
  const secondary = themeRgb?.secondary ?? '169 166 249'
  const list      = Array.isArray(lessons) ? lessons : []
  const current   = list[currentIndex] ?? null
  const isCompleted = current ? completed.has(current.id) : false

  const completedCount = list.filter((l) => completed.has(l.id)).length

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
      <div className={cn('rounded-3xl border-2 border-dashed border-border bg-muted/30 p-12', className)}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
            <BookOpen className="h-10 w-10 text-muted-foreground" aria-hidden />
          </div>
          <p className="text-base font-bold text-foreground">No lessons in this study yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-5', className)}>
      {/* Chapter path / progress dots */}
      <div className="flex items-center gap-0">
        {list.map((l, i) => {
          const done    = completed.has(l.id)
          const active  = i === currentIndex
          return (
            <div key={l.id} className="flex items-center">
              <button
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  'relative flex h-9 w-9 items-center justify-center rounded-full text-xs font-black transition-all duration-200',
                  done  && 'bg-green-500 text-white shadow-md scale-105',
                  active && !done && 'text-white shadow-md scale-110',
                  !active && !done && 'bg-muted text-muted-foreground hover:bg-muted-foreground/20',
                )}
                style={active && !done ? { backgroundColor: `rgb(${primary})` } : undefined}
                aria-label={`Lesson ${i + 1}: ${l.title}`}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
                {active && (
                  <span
                    className="absolute inset-0 rounded-full animate-ping opacity-25"
                    style={{ backgroundColor: `rgb(${primary})` }}
                  />
                )}
              </button>
              {i < list.length - 1 && (
                <div
                  className={cn('h-1 w-6 rounded-full transition-all duration-500 sm:w-10', completed.has(l.id) ? 'bg-green-400' : 'bg-muted')}
                />
              )}
            </div>
          )
        })}
        <span className="ml-3 text-xs font-semibold text-muted-foreground">
          {completedCount}/{list.length} done
        </span>
      </div>

      {/* Lesson card */}
      <div
        className={cn(
          'overflow-hidden rounded-3xl border-2 transition-all duration-300 animate-fade-in',
          isCompleted ? 'border-green-400/50' : '',
        )}
        style={{
          borderColor: isCompleted ? undefined : `rgb(${primary} / 0.3)`,
          boxShadow: `0 4px 20px rgb(${primary} / 0.08)`,
        }}
      >
        <div className="p-6 sm:p-8">
          {/* Lesson header */}
          <div
            className="mb-5 flex items-center gap-3 rounded-2xl p-3"
            style={{ backgroundColor: `rgb(${primary} / 0.1)` }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white font-black text-sm"
              style={{ backgroundColor: `rgb(${primary})` }}
            >
              {currentIndex + 1}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Lesson {currentIndex + 1} of {list.length}
              </p>
              <h3 className="truncate font-bold text-foreground">{current?.title ?? ''}</h3>
            </div>
            {isCompleted && (
              <div className="ml-auto flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                <Star className="h-3.5 w-3.5 fill-green-500 text-green-500" />
                Done!
              </div>
            )}
          </div>

          {/* Body */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: `linear-gradient(135deg, rgb(${secondary}/0.15), rgb(${primary}/0.06))`,
            }}
          >
            <p className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground leading-relaxed">
              {current?.body ?? ''}
            </p>
          </div>

          {/* CTA */}
          <div className="mt-5">
            {!isCompleted ? (
              <Button
                size="lg"
                onClick={handleComplete}
                className="min-h-[48px] gap-2 rounded-2xl font-bold"
                style={{ backgroundColor: `rgb(${primary})`, color: 'white' }}
              >
                <Check className="h-5 w-5" />
                Got it! Mark as done ⭐
              </Button>
            ) : (
              <div className="flex items-center gap-2 rounded-2xl bg-green-50 px-5 py-3 text-sm font-bold text-green-700 dark:bg-green-900/20 dark:text-green-300 animate-bounce-in">
                <Star className="h-5 w-5 fill-green-500 text-green-500" />
                Lesson completed! Great work! 🎉
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
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
          Back
        </Button>

        {isCompleted && currentIndex < list.length - 1 && (
          <Button
            size="lg"
            onClick={handleNext}
            className="min-h-[44px] gap-2 rounded-xl px-6 font-bold"
            style={{ backgroundColor: `rgb(${primary})`, color: 'white' }}
          >
            Next Lesson
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}

        {!isCompleted && (
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
        )}
      </div>
    </div>
  )
}
