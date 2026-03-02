'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Layers, RotateCcw, CheckCircle2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const [isFlipped, setIsFlipped]       = useState(false)
  const [mastered, setMastered]         = useState<Set<string>>(new Set())
  const [allDone, setAllDone]           = useState(false)

  const primary   = themeRgb?.primary   ?? '91 87 165'
  const secondary = themeRgb?.secondary ?? '169 166 249'
  const list      = Array.isArray(cards) ? cards : []
  const current   = list[currentIndex] ?? null

  const handleFlip = useCallback(() => setIsFlipped((b) => !b), [])

  const handleMastered = useCallback(() => {
    if (!current) return
    const next = new Set(mastered)
    next.add(current.id)
    setMastered(next)
    if (next.size >= list.length) {
      setAllDone(true)
    } else {
      let idx = currentIndex + 1
      while (idx < list.length && next.has(list[idx].id)) idx++
      if (idx < list.length) {
        setCurrentIndex(idx)
        setIsFlipped(false)
      } else {
        setAllDone(true)
      }
    }
  }, [current, mastered, currentIndex, list])

  const handleNext = useCallback(() => {
    if (currentIndex < list.length - 1) {
      setCurrentIndex((i) => i + 1)
      setIsFlipped(false)
    }
  }, [currentIndex, list.length])

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
      setIsFlipped(false)
    }
  }, [currentIndex])

  const handleRestart = useCallback(() => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setMastered(new Set())
    setAllDone(false)
  }, [])

  if (list.length === 0) {
    return (
      <div className={cn('rounded-3xl border-2 border-dashed border-border bg-muted/30 p-12', className)}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
            <Layers className="h-10 w-10 text-muted-foreground" aria-hidden />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">No flashcards yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Add some in the Parent Customization panel!</p>
          </div>
        </div>
      </div>
    )
  }

  if (allDone) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-6 rounded-3xl border-2 p-12 text-center animate-bounce-in',
          className,
        )}
        style={{
          borderColor: `rgb(${primary} / 0.4)`,
          background: `linear-gradient(135deg, rgb(${secondary}/0.2), rgb(${primary}/0.1))`,
        }}
      >
        <div className="text-6xl animate-celebration select-none">🎉</div>
        <div>
          <p className="text-2xl font-black text-foreground">You mastered them all!</p>
          <p className="mt-2 text-sm text-muted-foreground">{list.length} cards completed · Amazing work!</p>
        </div>
        <Button
          size="lg"
          onClick={handleRestart}
          className="gap-2 rounded-2xl font-bold"
          style={{ backgroundColor: `rgb(${primary})`, color: 'white' }}
        >
          <RefreshCw className="h-4 w-4" />
          Study Again
        </Button>
      </div>
    )
  }

  const isMastered = current ? mastered.has(current.id) : false

  return (
    <div className={cn('space-y-5', className)}>
      {/* Progress dots */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5" role="progressbar" aria-valuenow={mastered.size} aria-valuemax={list.length}>
          {list.map((c, i) => (
            <button
              key={c.id}
              onClick={() => { setCurrentIndex(i); setIsFlipped(false) }}
              className={cn(
                'h-2.5 rounded-full transition-all duration-300',
                mastered.has(c.id)
                  ? 'w-2.5 bg-green-500'
                  : i === currentIndex
                  ? 'w-6'
                  : 'w-2.5 bg-muted',
              )}
              style={i === currentIndex && !mastered.has(c.id) ? { backgroundColor: `rgb(${primary})` } : undefined}
              aria-label={`Card ${i + 1}`}
            />
          ))}
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {mastered.size}/{list.length} mastered
        </span>
      </div>

      {/* 3-D flip card */}
      <div
        className="h-64 w-full cursor-pointer sm:h-72"
        style={{ perspective: '1200px' }}
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleFlip()}
        aria-label={isFlipped ? 'Showing answer – tap to flip' : 'Showing question – tap to flip'}
      >
        <div
          className="relative h-full w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front – question */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 p-8 text-center select-none"
            style={{
              borderColor: `rgb(${primary} / 0.3)`,
              background: `linear-gradient(135deg, rgb(${secondary}/0.2), rgb(${primary}/0.08))`,
              backfaceVisibility: 'hidden',
            }}
          >
            {current?.imageUrl && (
              <img src={current.imageUrl} alt="" className="mb-4 h-24 w-full rounded-xl object-cover" />
            )}
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Question</p>
            <p className="text-xl font-bold text-foreground">{current?.question ?? ''}</p>
            <p className="mt-4 text-xs text-muted-foreground">Tap to reveal answer ↓</p>
          </div>

          {/* Back – answer */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 p-8 text-center select-none"
            style={{
              borderColor: `rgb(${primary} / 0.5)`,
              background: `linear-gradient(135deg, rgb(${primary}/0.15), rgb(${secondary}/0.2))`,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Answer</p>
            <p className="text-xl font-bold text-foreground">{current?.answer ?? ''}</p>
            <p className="mt-4 text-xs text-muted-foreground">Tap to flip back ↓</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="min-h-[44px] rounded-xl"
          aria-label="Previous card"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          size="lg"
          onClick={handleFlip}
          className="min-h-[44px] gap-2 rounded-xl px-6 font-bold"
          style={{ backgroundColor: `rgb(${primary})`, color: 'white' }}
        >
          <RotateCcw className="h-4 w-4" />
          {isFlipped ? 'Show Question' : 'Show Answer'}
        </Button>

        {isFlipped && !isMastered && (
          <Button
            size="lg"
            onClick={handleMastered}
            className="min-h-[44px] gap-2 rounded-xl bg-green-500 px-6 font-bold text-white hover:bg-green-600"
          >
            <CheckCircle2 className="h-4 w-4" />
            Got it! ✓
          </Button>
        )}

        {isMastered && (
          <span className="flex items-center gap-1.5 rounded-xl bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Mastered ✓
          </span>
        )}

        <Button
          variant="outline"
          size="lg"
          onClick={handleNext}
          disabled={currentIndex >= list.length - 1}
          className="min-h-[44px] rounded-xl"
          aria-label="Next card"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Card {currentIndex + 1} of {list.length}
      </p>
    </div>
  )
}
