'use client'

import { useState, useCallback, useEffect } from 'react'
import { Lightbulb, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ReadAloudController } from './read-aloud-controller'
import { cn } from '@/lib/utils'
import type { Question, TextSizeLevel } from '@/types/study-viewer'

interface QuizPanelProps {
  questions: Question[] | null | undefined
  onSubmit?: (questionId: string, correct: boolean) => void
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

export function QuizPanel({
  questions: questionsProp,
  onSubmit,
  readAloudEnabled = false,
  textSize = 'normal',
  highContrast = false,
  className,
}: QuizPanelProps) {
  const questions = Array.isArray(questionsProp) ? questionsProp : []
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [fillValue, setFillValue] = useState('')
  const [dragOrder, setDragOrder] = useState<string[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const currentQuestion = questions[currentQuestionIndex] ?? null
  const total = questions.length
  const textClass = textSizeClasses[textSize] ?? textSizeClasses.normal

  useEffect(() => {
    const opts = currentQuestion?.options ?? []
    setDragOrder(Array.isArray(opts) ? [...opts] : [])
    setShowFeedback(false)
    setShowHint(false)
    setFillValue('')
  }, [currentQuestion?.id, currentQuestion?.options])

  const handleMCQSelect = useCallback(
    (option: string) => {
      if (!currentQuestion || showFeedback) return
      const correct = option === (currentQuestion.answer ?? '')
      setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }))
      setShowFeedback(true)
      onSubmit?.(currentQuestion.id, correct)
    },
    [currentQuestion, showFeedback, onSubmit]
  )

  const handleFillSubmit = useCallback(() => {
    if (!currentQuestion || showFeedback) return
    const answer = (currentQuestion.answer ?? '').toString().toLowerCase().trim()
    const userAnswer = fillValue.trim().toLowerCase()
    const correct = userAnswer === answer
    setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: fillValue }))
    setShowFeedback(true)
    onSubmit?.(currentQuestion.id, correct)
  }, [currentQuestion, fillValue, showFeedback, onSubmit])

  const handleDragSubmit = useCallback(() => {
    if (!currentQuestion || showFeedback) return
    const expected = (currentQuestion.answer ?? '').toString()
    const userOrder = dragOrder.length > 0 ? dragOrder.join(',') : (currentQuestion.options ?? []).join(',')
    const correct = userOrder === expected
    setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: userOrder }))
    setShowFeedback(true)
    onSubmit?.(currentQuestion.id, correct)
  }, [currentQuestion, dragOrder, showFeedback, onSubmit])

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < total - 1) {
      setCurrentQuestionIndex((i) => i + 1)
      setFillValue('')
      setDragOrder((currentQuestion?.options ?? []).slice())
      setShowFeedback(false)
      setShowHint(false)
    }
  }, [currentQuestionIndex, total, currentQuestion?.options])

  const handlePrev = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1)
      setShowFeedback(false)
      setShowHint(false)
    }
  }, [currentQuestionIndex])

  if (total === 0) {
    return (
      <Card className={cn('rounded-3xl', className)}>
        <CardContent className="flex flex-col items-center justify-center gap-4 p-12">
          <p className="text-muted-foreground">No questions in this quiz.</p>
        </CardContent>
      </Card>
    )
  }

  const options = currentQuestion?.options ?? []
  const userAnswer = userAnswers[currentQuestion?.id ?? ''] ?? ''
  const correctAnswer = (currentQuestion?.answer ?? '').toString()
  const isCorrect = showFeedback && userAnswer.toLowerCase() === correctAnswer.toLowerCase()

  return (
    <div className={cn('space-y-6', className)}>
      <Card
        className={cn(
          'overflow-hidden rounded-3xl border-2 transition-all duration-300',
          highContrast ? 'border-primary shadow-lg' : 'border-border shadow-card hover:shadow-card-hover'
        )}
      >
        <CardContent className="p-8">
          <div className="space-y-4">
            <p className={cn(textClass, 'font-medium text-foreground', highContrast && 'font-bold')}>
              {currentQuestion?.prompt ?? ''}
            </p>
            {readAloudEnabled && (
              <ReadAloudController text={currentQuestion?.prompt ?? ''} disabled={showFeedback} />
            )}
            {currentQuestion?.hint && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(!showHint)}
                className="gap-2 rounded-xl"
                aria-label="Toggle hint"
              >
                <Lightbulb className="h-4 w-4" />
                Hint
              </Button>
            )}
            {showHint && currentQuestion?.hint && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <p className="text-sm text-foreground">{currentQuestion.hint}</p>
              </div>
            )}
          </div>

          {currentQuestion?.type === 'MCQ' && (
            <div className="mt-6 space-y-3">
              {(options ?? []).map((opt, i) => {
                const selected = userAnswer === opt
                const showCorrect = showFeedback && opt === correctAnswer
                const showWrong = showFeedback && selected && opt !== correctAnswer
                return (
                  <Button
                    key={`${currentQuestion.id}-${i}`}
                    variant="outline"
                    size="lg"
                    onClick={() => handleMCQSelect(opt)}
                    disabled={showFeedback}
                    className={cn(
                      'min-h-[48px] w-full justify-start rounded-xl text-left',
                      showCorrect && 'border-green-500 bg-green-500/10',
                      showWrong && 'border-red-500 bg-red-500/10'
                    )}
                    aria-pressed={selected}
                  >
                    {opt}
                    {showCorrect && <Check className="ml-auto h-5 w-5 text-green-600" />}
                    {showWrong && <X className="ml-auto h-5 w-5 text-red-600" />}
                  </Button>
                )
              })}
            </div>
          )}

          {currentQuestion?.type === 'FILL' && (
            <div className="mt-6 space-y-4">
              <Input
                type="text"
                value={fillValue}
                onChange={(e) => setFillValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFillSubmit()}
                placeholder="Type your answer..."
                disabled={showFeedback}
                autoComplete="off"
                className="min-h-[48px] rounded-xl text-lg"
                aria-label="Your answer"
              />
              <Button
                size="lg"
                onClick={handleFillSubmit}
                disabled={showFeedback || !fillValue.trim()}
                className="min-h-[48px] rounded-xl"
              >
                Check Answer
              </Button>
              {showFeedback && (
                <p className={cn('text-sm font-medium', isCorrect ? 'text-green-600' : 'text-red-600')}>
                  {isCorrect ? 'Correct!' : `The answer is: ${correctAnswer}`}
                </p>
              )}
            </div>
          )}

          {currentQuestion?.type === 'DRAG' && (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Tap options to reorder. Current order: {(dragOrder.length > 0 ? dragOrder : options).join(' → ')}
              </p>
              <div className="flex flex-wrap gap-2">
                {(dragOrder.length > 0 ? dragOrder : options).map((opt, i) => (
                  <Button
                    key={`drag-${i}`}
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (showFeedback) return
                      const current = dragOrder.length > 0 ? dragOrder : options
                      const filtered = current.filter((o) => o !== opt)
                      const newOrder = [opt, ...filtered]
                      setDragOrder(newOrder)
                    }}
                    disabled={showFeedback}
                    className="min-h-[44px] rounded-xl"
                  >
                    {opt}
                  </Button>
                ))}
              </div>
              <Button
                size="lg"
                onClick={handleDragSubmit}
                disabled={showFeedback}
                className="min-h-[48px] rounded-xl"
              >
                Check Order
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          aria-label="Previous question"
          className="min-h-[44px] rounded-xl"
        >
          Previous
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          {currentQuestionIndex + 1} of {total}
        </span>
        {showFeedback && currentQuestionIndex < total - 1 ? (
          <Button size="lg" onClick={handleNext} className="min-h-[44px] rounded-xl">
            Next
          </Button>
        ) : (
          <div className="w-20" />
        )}
      </div>
    </div>
  )
}
