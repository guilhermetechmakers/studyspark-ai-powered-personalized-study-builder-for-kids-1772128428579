'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Check, X, HelpCircle, Trophy, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const [currentIndex, setCurrentIndex]   = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [fillValue, setFillValue]         = useState('')
  const [showFeedback, setShowFeedback]   = useState(false)
  const [score, setScore]                 = useState(0)
  const [answered, setAnswered]           = useState<boolean[]>([])
  const [finished, setFinished]           = useState(false)
  const [feedbackAnim, setFeedbackAnim]   = useState<'correct' | 'wrong' | null>(null)

  const primary   = themeRgb?.primary   ?? '91 87 165'
  const secondary = themeRgb?.secondary ?? '169 166 249'
  const list      = Array.isArray(quizzes) ? quizzes : []
  const current   = list[currentIndex] ?? null
  const correctAnswer = current?.answer ?? ''

  const isCorrect =
    showFeedback &&
    (selectedOption === correctAnswer ||
      fillValue.trim().toLowerCase() === correctAnswer.toLowerCase())

  const handleSelect = useCallback((opt: string) => {
    if (showFeedback) return
    setSelectedOption(opt)
    setShowFeedback(true)
    const correct = opt === correctAnswer
    if (correct) setScore((s) => s + 1)
    setAnswered((a) => [...a, correct])
    setFeedbackAnim(correct ? 'correct' : 'wrong')
    setTimeout(() => setFeedbackAnim(null), 600)
  }, [showFeedback, correctAnswer])

  const handleFillSubmit = useCallback(() => {
    if (showFeedback || !fillValue.trim()) return
    setShowFeedback(true)
    const correct = fillValue.trim().toLowerCase() === correctAnswer.toLowerCase()
    if (correct) setScore((s) => s + 1)
    setAnswered((a) => [...a, correct])
    setFeedbackAnim(correct ? 'correct' : 'wrong')
    setTimeout(() => setFeedbackAnim(null), 600)
  }, [showFeedback, fillValue, correctAnswer])

  const handleNext = useCallback(() => {
    if (currentIndex < list.length - 1) {
      setCurrentIndex((i) => i + 1)
      setSelectedOption(null)
      setFillValue('')
      setShowFeedback(false)
    } else {
      setFinished(true)
    }
  }, [currentIndex, list.length])

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
      setShowFeedback(false)
      setSelectedOption(null)
      setFillValue('')
    }
  }, [currentIndex])

  const handleRestart = useCallback(() => {
    setCurrentIndex(0)
    setSelectedOption(null)
    setFillValue('')
    setShowFeedback(false)
    setScore(0)
    setAnswered([])
    setFinished(false)
  }, [])

  if (list.length === 0) {
    return (
      <div className={cn('rounded-3xl border-2 border-dashed border-border bg-muted/30 p-12', className)}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
            <HelpCircle className="h-10 w-10 text-muted-foreground" aria-hidden />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">No quiz questions yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Add some in the Parent Customization panel!</p>
          </div>
        </div>
      </div>
    )
  }

  /* ── Finished screen ── */
  if (finished) {
    const pct = Math.round((score / list.length) * 100)
    const isPerfect = score === list.length
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
        <div className="text-6xl animate-celebration select-none">
          {isPerfect ? '🏆' : pct >= 60 ? '⭐' : '💪'}
        </div>
        <div>
          <p className="text-2xl font-black text-foreground">
            {isPerfect ? 'Perfect score!' : pct >= 60 ? 'Great job!' : 'Keep practising!'}
          </p>
          <p className="mt-1 text-4xl font-black" style={{ color: `rgb(${primary})` }}>
            {score}/{list.length}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{pct}% correct</p>
        </div>
        <Button
          size="lg"
          onClick={handleRestart}
          className="gap-2 rounded-2xl font-bold"
          style={{ backgroundColor: `rgb(${primary})`, color: 'white' }}
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  const options     = current?.options ?? []
  const hasOptions  = options.length > 0

  return (
    <div className={cn('space-y-5', className)}>
      {/* Score header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-3 py-1.5 dark:bg-amber-900/20">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{score} pts</span>
        </div>
        <div className="flex gap-1.5">
          {list.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2.5 w-2.5 rounded-full transition-all',
                i < answered.length
                  ? answered[i] ? 'bg-green-500' : 'bg-red-400'
                  : i === currentIndex
                  ? 'w-5 bg-primary'
                  : 'bg-muted',
              )}
              style={i === currentIndex ? { backgroundColor: `rgb(${primary})` } : undefined}
            />
          ))}
        </div>
      </div>

      {/* Question card */}
      <div
        className={cn(
          'overflow-hidden rounded-3xl border-2 transition-all duration-300',
          feedbackAnim === 'correct' && 'animate-correct-pulse',
          feedbackAnim === 'wrong'   && 'animate-wrong-shake',
        )}
        style={{
          borderColor: showFeedback
            ? isCorrect ? 'rgb(34 197 94 / 0.6)' : 'rgb(239 68 68 / 0.6)'
            : `rgb(${primary} / 0.3)`,
          boxShadow: `0 4px 20px rgb(${primary} / 0.08)`,
        }}
      >
        <div className="p-6 sm:p-8">
          {/* Question label */}
          <div
            className="mb-5 flex items-center gap-2 rounded-xl px-4 py-2"
            style={{ backgroundColor: `rgb(${primary} / 0.1)` }}
          >
            <HelpCircle className="h-5 w-5" style={{ color: `rgb(${primary})` }} aria-hidden />
            <span className="text-sm font-semibold">
              Question {currentIndex + 1} of {list.length}
            </span>
          </div>

          <p className="mb-6 text-lg font-bold text-foreground">{current?.question ?? ''}</p>

          {hasOptions ? (
            <div className="space-y-3">
              {options.map((opt, idx) => {
                const selected    = selectedOption === opt
                const showCorrect = showFeedback && opt === correctAnswer
                const showWrong   = showFeedback && selected && opt !== correctAnswer
                return (
                  <Button
                    key={`${opt}-${idx}`}
                    variant="outline"
                    size="lg"
                    onClick={() => handleSelect(opt)}
                    disabled={showFeedback}
                    className={cn(
                      'min-h-[52px] w-full justify-start rounded-2xl text-left font-semibold transition-all duration-200',
                      !showFeedback && 'hover:border-primary/40 hover:bg-primary/5 hover:scale-[1.01]',
                      showCorrect && 'animate-correct-pulse border-green-500 bg-green-50 text-green-800',
                      showWrong   && 'animate-wrong-shake border-red-400 bg-red-50 text-red-700',
                    )}
                    aria-pressed={selected}
                  >
                    <span
                      className={cn(
                        'mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                        showCorrect ? 'bg-green-500 text-white' : showWrong ? 'bg-red-400 text-white' : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                    {showCorrect && <Check className="ml-auto h-5 w-5 shrink-0 text-green-600" aria-hidden />}
                    {showWrong   && <X    className="ml-auto h-5 w-5 shrink-0 text-red-500"   aria-hidden />}
                  </Button>
                )
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                type="text"
                value={fillValue}
                onChange={(e) => setFillValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFillSubmit()}
                placeholder="Type your answer…"
                disabled={showFeedback}
                className="min-h-[52px] rounded-2xl text-base"
                aria-label="Your answer"
              />
              <Button
                size="lg"
                onClick={handleFillSubmit}
                disabled={showFeedback || !fillValue.trim()}
                className="min-h-[48px] w-full rounded-2xl font-bold"
                style={{ backgroundColor: `rgb(${primary})`, color: 'white' }}
              >
                Check Answer
              </Button>
            </div>
          )}

          {/* Feedback banner */}
          {showFeedback && (
            <div
              className={cn(
                'mt-5 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold animate-fade-in',
                isCorrect
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
              )}
            >
              {isCorrect ? (
                <>
                  <span className="text-2xl select-none">🎉</span>
                  Correct! Well done!
                </>
              ) : (
                <>
                  <span className="text-2xl select-none">💡</span>
                  The answer is: <strong>{correctAnswer}</strong>
                </>
              )}
            </div>
          )}
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
          aria-label="Previous question"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </Button>

        {showFeedback ? (
          <Button
            size="lg"
            onClick={handleNext}
            className="min-h-[44px] gap-2 rounded-xl px-6 font-bold"
            style={{ backgroundColor: `rgb(${primary})`, color: 'white' }}
          >
            {currentIndex < list.length - 1 ? 'Next Question' : 'See Results'}
            <ChevronRight className="h-5 w-5" />
          </Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
