'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { StudyCard } from '@/types/study-customization'

interface GamifiedFlashcardsTabProps {
  cards: StudyCard[]
  themeRgb?: { primary: string; secondary: string }
  className?: string
}

export function GamifiedFlashcardsTab({
  cards,
  themeRgb,
  className,
}: GamifiedFlashcardsTabProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showBack, setShowBack] = useState(false)

  const primary = themeRgb?.primary ?? '91 87 165'
  const secondary = themeRgb?.secondary ?? '169 166 249'
  const list = Array.isArray(cards) ? cards : []
  const current = list[currentIndex] ?? null

  const handleFlip = useCallback(() => {
    setShowBack((b) => !b)
  }, [])

  const handleNext = useCallback(() => {
    if (currentIndex < list.length - 1) {
      setCurrentIndex((i) => i + 1)
      setShowBack(false)
    }
  }, [currentIndex, list.length])

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
      setShowBack(false)
    }
  }, [currentIndex])

  if (list.length === 0) {
    return (
      <Card className={cn('rounded-3xl', className)}>
        <CardContent className="flex flex-col items-center justify-center gap-4 p-12">
          <Layers className="h-12 w-12 text-muted-foreground" aria-hidden />
          <p className="text-muted-foreground">
            No flashcards yet. Add some in Parent Customization!
          </p>
        </CardContent>
      </Card>
    )
  }

  const content = showBack
    ? (current?.answer ?? '')
    : (current?.question ?? '')

  return (
    <div className={cn('space-y-6', className)}>
      <Card
        className={cn(
          'overflow-hidden rounded-3xl border-2 transition-all duration-300',
          'hover:shadow-card-hover hover:scale-[1.01]',
          'animate-fade-in'
        )}
        style={{
          borderColor: `rgb(${primary} / 0.3)`,
          boxShadow: `0 4px 20px rgb(${primary} / 0.1)`,
        }}
      >
        <CardContent className="p-6 sm:p-8">
          <div
            className="relative min-h-[220px] overflow-hidden rounded-2xl p-6"
            style={{
              background: `linear-gradient(135deg, rgb(${secondary} / 0.25), rgb(${primary} / 0.12))`,
            }}
          >
            {current?.imageUrl && (
              <div className="mb-4 overflow-hidden rounded-xl">
                <img
                  src={current.imageUrl}
                  alt=""
                  className="h-32 w-full object-cover"
                />
              </div>
            )}
            <p className="text-lg font-medium text-foreground">{content}</p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={handleFlip}
              className="min-h-[48px] rounded-xl"
              style={{
                backgroundColor: `rgb(${primary})`,
                color: 'white',
              }}
              aria-label={showBack ? 'Show question' : 'Show answer'}
            >
              {showBack ? 'Show Question' : 'Show Answer'}
            </Button>
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
          aria-label="Previous card"
        >
          <ChevronLeft className="h-5 w-5" />
          Previous
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          {currentIndex + 1} of {list.length}
        </span>
        <Button
          variant="outline"
          size="lg"
          onClick={handleNext}
          disabled={currentIndex >= list.length - 1}
          className="min-h-[44px] rounded-xl"
          aria-label="Next card"
        >
          Next
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
