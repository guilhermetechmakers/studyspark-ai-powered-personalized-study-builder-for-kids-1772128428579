'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ReadAloudController } from './read-aloud-controller'
import { cn } from '@/lib/utils'
import type { CardItem, TextSizeLevel } from '@/types/study-viewer'

interface FlashcardsPanelProps {
  cards: CardItem[] | null | undefined
  onAnswer?: (cardId: string, correct: boolean) => void
  readAloudEnabled?: boolean
  textSize?: TextSizeLevel
  highContrast?: boolean
  className?: string
}

const textSizeClasses: Record<TextSizeLevel, string> = {
  normal: 'text-lg',
  large: 'text-xl',
  xlarge: 'text-2xl',
}

export function FlashcardsPanel({
  cards: cardsProp,
  onAnswer,
  readAloudEnabled = false,
  textSize = 'normal',
  highContrast = false,
  className,
}: FlashcardsPanelProps) {
  const cards = Array.isArray(cardsProp) ? cardsProp : []
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [showBack, setShowBack] = useState(false)

  const currentCard = cards[currentCardIndex] ?? null
  const total = cards.length
  const textClass = textSizeClasses[textSize] ?? textSizeClasses.normal

  const handleFlip = useCallback(() => {
    if (isFlipping || !currentCard) return
    setIsFlipping(true)
    setShowBack((prev) => !prev)
    setTimeout(() => setIsFlipping(false), 400)
  }, [currentCard, isFlipping])

  const handleNext = useCallback(() => {
    if (currentCardIndex < total - 1) {
      setCurrentCardIndex((i) => i + 1)
      setShowBack(false)
      onAnswer?.(currentCard?.id ?? '', true)
    }
  }, [currentCardIndex, total, currentCard?.id, onAnswer])

  const handlePrev = useCallback(() => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((i) => i - 1)
      setShowBack(false)
    }
  }, [currentCardIndex])

  if (total === 0) {
    return (
      <Card className={cn('rounded-3xl', className)}>
        <CardContent className="flex flex-col items-center justify-center gap-4 p-12">
          <p className="text-muted-foreground">No flashcards in this set.</p>
        </CardContent>
      </Card>
    )
  }

  const content = showBack ? (currentCard?.back ?? '') : (currentCard?.front ?? '')
  const isBack = showBack

  return (
    <div className={cn('space-y-6', className)}>
      <Card
        className={cn(
          'overflow-hidden rounded-3xl border-2 transition-all duration-300',
          highContrast ? 'border-primary shadow-lg' : 'border-border shadow-card hover:shadow-card-hover'
        )}
      >
        <CardContent className="p-8">
          <div
            className={cn(
              'relative min-h-[200px] rounded-2xl bg-gradient-to-br from-[rgb(var(--peach-light))]/40 to-[rgb(var(--lavender))]/20 p-6',
              highContrast && 'from-primary/20 to-primary/10'
            )}
          >
            <div
              className={cn(
                'transition-transform duration-300',
                isBack && 'scale-x-[-1]'
              )}
            >
              <p
                className={cn(
                  textClass,
                  'font-medium text-foreground',
                  highContrast && 'font-bold'
                )}
              >
                {content}
              </p>
            </div>
            {readAloudEnabled && (
              <div className="mt-4">
                <ReadAloudController text={content} disabled={isFlipping} />
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={handleFlip}
              disabled={isFlipping}
              className="min-h-[48px] rounded-xl px-8"
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
          disabled={currentCardIndex === 0}
          aria-label="Previous card"
          className="min-h-[44px] rounded-xl"
        >
          <ChevronLeft className="h-5 w-5" />
          Previous
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          {currentCardIndex + 1} of {total}
        </span>
        <Button
          variant="outline"
          size="lg"
          onClick={handleNext}
          disabled={currentCardIndex >= total - 1}
          aria-label="Next card"
          className="min-h-[44px] rounded-xl"
        >
          Next
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
