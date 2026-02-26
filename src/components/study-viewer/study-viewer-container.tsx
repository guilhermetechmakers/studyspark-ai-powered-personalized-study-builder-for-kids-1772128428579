'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Sparkles, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
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
  className,
}: StudyViewerContainerProps) {
  const activities = useMemo(
    () => (Array.isArray(studySetProp?.activities) ? studySetProp!.activities : []),
    [studySetProp]
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState<ProgressData>(() => ({
    ...DEFAULT_PROGRESS,
    total: activities.length,
    ...studySetProp?.progress,
  }))
  const [isParentView, setIsParentView] = useState(false)
  const [isParentCollapsed, setIsParentCollapsed] = useState(false)
  const [textSize, setTextSize] = useState<TextSizeLevel>('normal')
  const [highContrast, setHighContrast] = useState(false)
  const [readAloudEnabled, setReadAloudEnabled] = useState(false)
  const [sessionStartTime] = useState(Date.now())

  const currentActivity = activities[currentIndex] ?? null
  const activityType = currentActivity?.type ?? 'flashcard'
  const content = currentActivity?.content

  const progressPercent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000)
      setProgress((p) => ({ ...p, timeSpent: (studySetProp?.progress?.timeSpent ?? 0) + elapsed }))
    }, 1000)
    return () => clearInterval(interval)
  }, [sessionStartTime, studySetProp?.progress?.timeSpent])

  const handleAnswer = useCallback((correct: boolean) => {
    setProgress((p) => ({
      ...p,
      stars: (p.stars ?? 0) + (correct ? 1 : 0),
      completed: Math.min((p.completed ?? 0) + 1, p.total),
    }))
  }, [])

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

  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br from-[rgb(var(--peach-light))]/20 via-background to-[rgb(var(--lavender))]/10',
        highContrast && 'from-primary/10 to-primary/5',
        className
      )}
    >
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            aria-label="Back to parent dashboard"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to parent
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">StudySpark</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleParentToggle}
            aria-label="Open parent view"
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Parent
          </Button>
        </div>
        <div className="px-4 pb-2">
          <div className="flex items-center gap-4">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {(studySetProp?.title ?? 'S').charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Progress value={progressPercent} className="h-2" />
              <p className="mt-1 text-center text-xs text-muted-foreground">
                {progress.completed} of {progress.total} completed
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl px-4 py-6">
        <div className="mb-6">
          <AccessibilityControls
            textSize={textSize}
            highContrast={highContrast}
            readAloud={readAloudEnabled}
            onTextSizeChange={setTextSize}
            onHighContrastChange={setHighContrast}
            onReadAloudChange={setReadAloudEnabled}
          />
        </div>

        <ActivityCarousel
          activities={activities}
          currentIndex={currentIndex}
          onChangeIndex={setCurrentIndex}
        />

        <div className="mt-8">
          {activityType === 'flashcard' && (
            <FlashcardsPanel
              cards={cards}
              onAnswer={(_, correct) => handleAnswer(correct)}
              readAloudEnabled={readAloudEnabled}
              textSize={textSize}
              highContrast={highContrast}
            />
          )}
          {activityType === 'quiz' && (
            <QuizPanel
              questions={questions}
              onSubmit={(_, correct) => handleAnswer(correct)}
              readAloudEnabled={readAloudEnabled}
              textSize={textSize}
              highContrast={highContrast}
            />
          )}
          {activityType === 'lesson' && (
            <LessonPanel
              lessons={lessons}
              onCompleteSection={() => handleAnswer(true)}
              readAloudEnabled={readAloudEnabled}
              textSize={textSize}
              highContrast={highContrast}
            />
          )}
        </div>

        <div className="mt-8">
          <GamificationPanel stats={progress} />
        </div>

        {allComplete && (
          <div className="mt-8 animate-bounce-in rounded-3xl border-2 border-primary bg-primary/10 p-8 text-center">
            <p className="text-2xl font-bold text-foreground">🎉 Great job!</p>
            <p className="mt-2 text-muted-foreground">You completed this study set!</p>
            <Button size="lg" className="mt-4" onClick={onComplete}>
              Finish
            </Button>
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
