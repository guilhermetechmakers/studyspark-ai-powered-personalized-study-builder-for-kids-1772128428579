'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, Check, X, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface QuizItem {
  question: string
  options?: string[]
  answer: string
}

interface GamifiedQuizzesTabProps {
  quizzes: QuizItem[]
  themeRgb?: { primary: string; secondary: string }
  className?: string
}

export function GamifiedQuizzesTab({
  quizzes,
  themeRgb,
  className,
}: GamifiedQuizzesTabProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [fillValue, setFillValue] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)

  const primary = themeRgb?.primary ?? '91 87 165'
  const list = Array.isArray(quizzes) ? quizzes : []
  const current = list[currentIndex] ?? null
  const correctAnswer = current?.answer ?? ''
  const isCorrect =
    showFeedback &&
    (selectedOption === correctAnswer ||
      fillValue.trim().toLowerCase() === correctAnswer.toLowerCase())

  const handleSelect = useCallback(
    (opt: string) => {
      if (showFeedback) return
      setSelectedOption(opt)
      setShowFeedback(true)
    },
    [showFeedback]
  )

  const handleFillSubmit = useCallback(() => {
    if (showFeedback) return
    setShowFeedback(true)
  }, [showFeedback])

  const handleNext = useCallback(() => {
    if (currentIndex < list.length - 1) {
      setCurrentIndex((i) => i + 1)
      setSelectedOption(null)
      setFillValue('')
      setShowFeedback(false)
    }
  }, [currentIndex, list.length])

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
      setShowFeedback(false)
    }
  }, [currentIndex])

  if (list.length === 0) {
    return (
      <Card className={cn('rounded-3xl', className)}>
        <CardContent className="flex flex-col items-center justify-center gap-4 p-12">
          <HelpCircle className="h-12 w-12 text-muted-foreground" aria-hidden />
          <p className="text-muted-foreground">
            No quiz questions yet. Add some in Parent Customization!
          </p>
        </CardContent>
      </Card>
    )
  }

  const options = current?.options ?? []
  const hasOptions = options.length > 0

  return (
    <div className={cn('space-y-6', className)}>
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
          <div
            className="mb-6 flex items-center gap-2 rounded-xl px-4 py-2"
            style={{ backgroundColor: `rgb(${primary} / 0.1)` }}
          >
            <HelpCircle
              className="h-5 w-5"
              style={{ color: `rgb(${primary})` }}
              aria-hidden
            />
            <span className="text-sm font-medium">Question {currentIndex + 1}</span>
          </div>

          <p className="mb-6 text-lg font-medium text-foreground">
            {current?.question ?? ''}
          </p>

          {hasOptions ? (
            <div className="space-y-3">
              {options.map((opt) => {
                const selected = selectedOption === opt
                const showCorrect = showFeedback && opt === correctAnswer
                const showWrong = showFeedback && selected && opt !== correctAnswer
                return (
                  <Button
                    key={opt}
                    variant="outline"
                    size="lg"
                    onClick={() => handleSelect(opt)}
                    disabled={showFeedback}
                    className={cn(
                      'min-h-[48px] w-full justify-start rounded-xl text-left transition-all',
                      showCorrect && 'border-green-500 bg-green-500/10',
                      showWrong && 'border-red-500 bg-red-500/10'
                    )}
                    aria-pressed={selected}
                  >
                    {opt}
                    {showCorrect && (
                      <Check className="ml-auto h-5 w-5 text-green-600" aria-hidden />
                    )}
                    {showWrong && (
                      <X className="ml-auto h-5 w-5 text-red-600" aria-hidden />
                    )}
                  </Button>
                )
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                type="text"
                value={fillValue}
                onChange={(e) => setFillValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFillSubmit()}
                placeholder="Type your answer..."
                disabled={showFeedback}
                className="min-h-[48px] rounded-xl text-lg"
                aria-label="Your answer"
              />
              <Button
                size="lg"
                onClick={handleFillSubmit}
                disabled={showFeedback || !fillValue.trim()}
                className="min-h-[48px] rounded-xl"
                style={{
                  backgroundColor: `rgb(${primary})`,
                  color: 'white',
                }}
              >
                Check Answer
              </Button>
            </div>
          )}

          {showFeedback && (
            <p
              className={cn(
                'mt-4 flex items-center gap-2 text-sm font-medium',
                isCorrect ? 'text-green-600' : 'text-red-600'
              )}
            >
              {isCorrect ? (
                <>
                  <Check className="h-5 w-5" aria-hidden />
                  Correct!
                </>
              ) : (
                <>
                  <X className="h-5 w-5" aria-hidden />
                  The answer is: {correctAnswer}
                </>
              )}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="min-h-[44px] rounded-xl"
          aria-label="Previous question"
        >
          <ChevronLeft className="h-5 w-5" />
          Previous
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          {currentIndex + 1} of {list.length}
        </span>
        {showFeedback && currentIndex < list.length - 1 ? (
          <Button
            size="lg"
            onClick={handleNext}
            className="min-h-[44px] rounded-xl"
            style={{
              backgroundColor: `rgb(${primary})`,
              color: 'white',
            }}
          >
            Next
          </Button>
        ) : (
          <div className="w-20" />
        )}
      </div>
    </div>
  )
}
