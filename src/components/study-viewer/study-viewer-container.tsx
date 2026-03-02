'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { Sparkles, Star, Users, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ActivityCarousel } from './activity-carousel'
import { FlashcardsPanel } from './flashcards-panel'
import { QuizPanel } from './quiz-panel'
import { LessonPanel } from './lesson-panel'
import { GamificationPanel } from './gamification-panel'
import { ParentViewOverlay } from './parent-view-overlay'
import { AccessibilityControls } from './accessibility-controls'
import { cn } from '@/lib/utils'
import type {
  StudySet,
  CardItem,
  Question,
  LessonChapter,
  ProgressData,
  TextSizeLevel,
} from '@/types/study-viewer'

interface StudyViewerContainerProps {
  studySet: StudySet | null | undefined
  mode?: 'flashcards' | 'quizzes' | 'lessons'
  onComplete?: () => void
  onParentToggle?: (open: boolean) => void
  sessionToken?: string | null
  onAttemptSubmit?: (params: {
    activityId: string
    score: number
    timeSpentMs: number
    hintsUsed: number
  }) => Promise<void>
  className?: string
}

const DEFAULT_PROGRESS: ProgressData = {
  total: 0,
  completed: 0,
  stars: 0,
  timeSpent: 0,
  streak: 0,
  badges: [],
}

export function StudyViewerContainer({
  studySet: studySetProp,
  onComplete,
  onParentToggle,
  sessionToken,
  onAttemptSubmit,
  className,
}: StudyViewerContainerProps) {
  const activities = useMemo(
    () => (Array.isArray(studySetProp?.activities) ? studySetProp!.activities : []),
    [studySetProp],
  )

  const [currentIndex, setCurrentIndex]   = useState(0)
  const [progress, setProgress]           = useState<ProgressData>(() => ({
    ...DEFAULT_PROGRESS,
    total: activities.length,
    ...studySetProp?.progress,
  }))
  const [isParentView, setIsParentView]         = useState(false)
  const [isParentCollapsed, setIsParentCollapsed] = useState(false)
  const [textSize, setTextSize]                 = useState<TextSizeLevel>('normal')
  const [highContrast, setHighContrast]         = useState(false)
  const [readAloudEnabled, setReadAloudEnabled] = useState(false)
  const [sessionStartTime]                      = useState(Date.now())
  const [activityStartTime, setActivityStartTime] = useState(Date.now())
  const [hintsUsedCurrentActivity, setHintsUsedCurrentActivity] = useState(0)
  const [justAnsweredCorrect, setJustAnsweredCorrect] = useState(false)

  const currentActivity = activities[currentIndex] ?? null
  const activityType    = currentActivity?.type ?? 'flashcard'
  const content         = currentActivity?.content

  const progressPercent = progress.total > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : 0

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000)
      setProgress((p) => ({ ...p, timeSpent: (studySetProp?.progress?.timeSpent ?? 0) + elapsed }))
    }, 1000)
    return () => clearInterval(interval)
  }, [sessionStartTime, studySetProp?.progress?.timeSpent])

  useEffect(() => {
    setActivityStartTime(Date.now())
    setHintsUsedCurrentActivity(0)
  }, [currentIndex])

  const handleAnswer = useCallback(
    async (correct: boolean) => {
      setProgress((p) => ({
        ...p,
        stars:     (p.stars     ?? 0) + (correct ? 1 : 0),
        completed: Math.min((p.completed ?? 0) + 1, p.total),
      }))

      if (correct) {
        setJustAnsweredCorrect(true)
        setTimeout(() => setJustAnsweredCorrect(false), 800)
      }

      if (sessionToken && currentActivity?.id && onAttemptSubmit) {
        const timeSpentMs = Date.now() - activityStartTime
        await onAttemptSubmit({
          activityId: currentActivity.id,
          score: correct ? 10 : 0,
          timeSpentMs,
          hintsUsed: hintsUsedCurrentActivity,
        })
      }
      setHintsUsedCurrentActivity(0)
    },
    [sessionToken, currentActivity?.id, onAttemptSubmit, activityStartTime, hintsUsedCurrentActivity],
  )

  const handleParentToggle = useCallback(() => {
    setIsParentView((v) => !v)
    onParentToggle?.(!isParentView)
  }, [isParentView, onParentToggle])

  const cards = useMemo(() => {
    if (activityType === 'flashcard' && Array.isArray(content)) return content as CardItem[]
    return []
  }, [activityType, content])

  const questions = useMemo(() => {
    if (activityType === 'quiz' && Array.isArray(content)) return content as Question[]
    return []
  }, [activityType, content])

  const lessons = useMemo(() => {
    if (activityType === 'lesson' && Array.isArray(content)) return content as LessonChapter[]
    return []
  }, [activityType, content])

  const allComplete = progress.total > 0 && progress.completed >= progress.total
  const studyTitle  = studySetProp?.title ?? 'Study Time!'

  return (
    <div
      className={cn(
        'min-h-screen',
        highContrast
          ? 'bg-background'
          : 'bg-gradient-to-br from-[rgb(var(--peach-light))]/30 via-background to-[rgb(var(--lavender))]/15',
        className,
      )}
    >
      {/* ── Kid-friendly header ───────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Left: branding */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-primary">StudySpark ⚡</p>
              <p className="text-sm font-black text-foreground truncate max-w-[180px]">{studyTitle}</p>
            </div>
            <p className="text-sm font-black text-foreground sm:hidden truncate max-w-[120px]">{studyTitle}</p>
          </div>

          {/* Center: star score display */}
          <div className="flex items-center gap-1.5 rounded-2xl bg-amber-50 px-4 py-1.5 shadow-sm dark:bg-amber-900/20">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <span
              className={cn(
                'text-lg font-black text-amber-700 dark:text-amber-300 transition-transform duration-200',
                justAnsweredCorrect && 'scale-150',
              )}
            >
              {progress.stars ?? 0}
            </span>
          </div>

          {/* Right: parent overlay toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleParentToggle}
            aria-label="Open parent view"
            className="gap-1.5 rounded-xl"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Parent</span>
          </Button>
        </div>

        {/* Progress bar strip */}
        <div className="h-3 w-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-r-full bg-gradient-to-r from-primary to-secondary transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${progressPercent}% complete`}
          />
        </div>

        {/* Progress label */}
        <div className="container px-4 pb-2 pt-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{progress.completed} of {progress.total} done</span>
            <span className="font-bold">{progressPercent}%</span>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl px-4 py-6 space-y-6">
        {/* Accessibility controls */}
        <AccessibilityControls
          textSize={textSize}
          highContrast={highContrast}
          readAloud={readAloudEnabled}
          onTextSizeChange={setTextSize}
          onHighContrastChange={setHighContrast}
          onReadAloudChange={setReadAloudEnabled}
        />

        {/* Activity carousel */}
        <ActivityCarousel
          activities={activities}
          currentIndex={currentIndex}
          onChangeIndex={setCurrentIndex}
        />

        {/* Activity panel */}
        <div>
          {activityType === 'flashcard' && (
            <FlashcardsPanel
              cards={cards}
              onAnswer={(_, correct) => void handleAnswer(correct)}
              readAloudEnabled={readAloudEnabled}
              textSize={textSize}
              highContrast={highContrast}
            />
          )}
          {activityType === 'quiz' && (
            <QuizPanel
              questions={questions}
              onSubmit={(_, correct) => void handleAnswer(correct)}
              onHintUse={() => setHintsUsedCurrentActivity((n) => n + 1)}
              readAloudEnabled={readAloudEnabled}
              textSize={textSize}
              highContrast={highContrast}
            />
          )}
          {activityType === 'lesson' && (
            <LessonPanel
              lessons={lessons}
              onCompleteSection={() => void handleAnswer(true)}
              readAloudEnabled={readAloudEnabled}
              textSize={textSize}
              highContrast={highContrast}
            />
          )}
        </div>

        {/* Gamification panel */}
        <GamificationPanel stats={progress} />

        {/* ── Completion celebration ──────────────────── */}
        {allComplete && (
          <div className="animate-bounce-in overflow-hidden rounded-3xl border-4 border-primary bg-gradient-to-br from-primary/15 to-secondary/15 p-10 text-center shadow-glow">
            <div className="text-7xl animate-celebration mb-4 select-none">🏆</div>
            <p className="text-3xl font-black text-foreground">Amazing!</p>
            <p className="mt-2 text-lg font-semibold text-muted-foreground">
              You completed the whole study set!
            </p>
            <div className="mt-4 flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-7 w-7 fill-amber-400 text-amber-400 animate-star-burst"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={onComplete}
                className="gap-2 rounded-2xl font-black bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
              >
                <Star className="h-5 w-5 fill-current" />
                Finish & Go Back
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-2xl gap-2">
                <Link to="/dashboard">
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        )}
      </main>

      <ParentViewOverlay
        visible={isParentView}
        summaryData={progress}
        onClose={() => {
          setIsParentView(false)
          onParentToggle?.(false)
        }}
        onToggleCollapse={() => setIsParentCollapsed((c) => !c)}
        isCollapsed={isParentCollapsed}
      />
    </div>
  )
}
