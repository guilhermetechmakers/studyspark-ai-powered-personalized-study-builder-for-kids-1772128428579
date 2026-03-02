'use client'

import { useState, useCallback, useEffect, useSyncExternalStore } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Settings2,
  Play,
  FileText,
  BookOpen,
  Layers,
  HelpCircle,
  Pencil,
  Rocket,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'
import { ParentCustomizationPanel } from '@/components/study-customization'
import {
  GamifiedSummaryTab,
  GamifiedLessonsTab,
  GamifiedFlashcardsTab,
  GamifiedQuizzesTab,
  GamifiedProgressBar,
} from '@/components/gamified-studies'
import {
  loadStudyCustomization,
  saveStudyCustomization,
} from '@/lib/study-customization-storage'
import type {
  StudyCustomization,
  StudyCard,
} from '@/types/study-customization'
import {
  DEFAULT_THEME,
  DEFAULT_GAMIFICATION,
} from '@/types/study-customization'
import {
  fetchStudyReviewFromSupabase,
} from '@/api/study-review-supabase'
import { getMockStudyReview } from '@/data/study-review-mock'
import type { SectionBlock, SectionContent } from '@/types/study-review'
import { cn } from '@/lib/utils'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''
const useSupabase = !!SUPABASE_URL

function extractSummary(sections: SectionBlock[]): string {
  const s = sections.find((x) => x.type === 'summary')
  if (!s) return ''
  return typeof s.content === 'string' ? s.content : ''
}

function extractLessons(sections: SectionBlock[]): { id: string; title: string; body: string }[] {
  const s = sections.find((x) => x.type === 'lessons')
  if (!s) return []
  const c = s.content as SectionContent | undefined
  const lessons = c?.lessons ?? []
  return lessons.map((l, i) => ({
    id: `l-${i}`,
    title: l.title ?? '',
    body: l.body ?? '',
  }))
}

function extractFlashcardsFromSections(sections: SectionBlock[]): StudyCard[] {
  const s = sections.find((x) => x.type === 'flashcards')
  if (!s) return []
  const c = s.content as SectionContent | undefined
  const list = c?.flashcards ?? []
  return list.map((f, i) => ({
    id: `fc-${i}`,
    question: f.front ?? '',
    answer: f.back ?? '',
  }))
}

function extractQuizzes(sections: SectionBlock[]): { question: string; options?: string[]; answer: string }[] {
  const s = sections.find((x) => x.type === 'quizzes')
  if (!s) return []
  const c = s.content as SectionContent | undefined
  const list = c?.quizzes ?? []
  return list.map((q) => ({
    question: q.question ?? '',
    options: q.options ?? [],
    answer: q.answer ?? '',
  }))
}

export function GamifiedStudyDashboardPage() {
  const { id } = useParams<{ id: string }>()
  const studyId = id ?? ''

  const [sections, setSections]     = useState<SectionBlock[]>([])
  const [studyTitle, setStudyTitle] = useState('')
  const [isLoading, setIsLoading]   = useState(true)
  const [customization, setCustomization] = useState<StudyCustomization>({
    theme: DEFAULT_THEME,
    cards: [],
    gamification: DEFAULT_GAMIFICATION,
    isLocked: false,
  })
  const [showCustomization, setShowCustomization] = useState(false)

  const isMobile = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia('(max-width: 767px)')
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => typeof window !== 'undefined' && window.innerWidth < 768,
    () => false,
  )

  useEffect(() => {
    if (!studyId) return
    const stored = loadStudyCustomization(studyId)
    if (stored) setCustomization(stored)
  }, [studyId])

  useEffect(() => {
    if (!studyId) return
    let cancelled = false
    setIsLoading(true)
    const load = async () => {
      try {
        if (useSupabase) {
          const data = await fetchStudyReviewFromSupabase(studyId)
          if (!cancelled) {
            setStudyTitle(data.study?.title ?? 'Untitled Study')
            setSections(Array.isArray(data.sections) ? data.sections : [])
          }
        } else {
          const mock = getMockStudyReview(studyId)
          if (!cancelled) {
            setStudyTitle(mock.study?.title ?? 'Untitled Study')
            setSections(mock.sections ?? [])
          }
        }
      } catch {
        if (!cancelled) {
          const mock = getMockStudyReview(studyId)
          setStudyTitle(mock.study?.title ?? 'Untitled Study')
          setSections(mock.sections ?? [])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [studyId])

  const handleCustomizationChange = useCallback(
    (partial: Partial<StudyCustomization>) => {
      const next: StudyCustomization = { ...customization, ...partial }
      setCustomization(next)
      saveStudyCustomization(studyId, next)
    },
    [studyId, customization],
  )

  const themeRgb    = customization.theme
  const customCards = customization.cards ?? []
  const sectionCards = extractFlashcardsFromSections(sections)
  const cards   = customCards.length > 0 ? customCards : sectionCards
  const summary = extractSummary(sections)
  const lessons = extractLessons(sections)
  const quizzes = extractQuizzes(sections)

  if (!studyId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Invalid study ID</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col p-6 gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-20 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-48 rounded-3xl" />
      </div>
    )
  }

  return (
    <div
      className="flex h-full flex-col"
      style={
        {
          '--study-primary':     themeRgb.primary,
          '--study-secondary':   themeRgb.secondary,
          '--study-background':  themeRgb.background,
        } as React.CSSProperties
      }
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <header
        className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-6"
        role="banner"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild aria-label="Back to studies">
            <Link to="/dashboard/studies">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <Avatar className="h-9 w-9">
            <AvatarFallback
              className="text-sm font-bold"
              style={{
                backgroundColor: `rgb(${themeRgb.primary} / 0.2)`,
                color: `rgb(${themeRgb.primary})`,
              }}
            >
              {(studyTitle ?? 'S').charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="truncate text-base font-extrabold text-foreground sm:text-lg">
              {studyTitle ?? 'Untitled Study'}
            </h1>
            <p className="text-[11px] text-muted-foreground">Parent preview</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showCustomization ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowCustomization((v) => !v)}
            className="gap-1.5"
            aria-label={showCustomization ? 'Hide customization' : 'Customise study'}
          >
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Customise</span>
          </Button>
          <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex gap-1.5">
            <Link to={`/dashboard/studies/${studyId}/edit`}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="mx-auto max-w-3xl space-y-6">

            {/* ── Launch for child banner ─────────────────── */}
            <div
              className={cn(
                'relative overflow-hidden rounded-3xl border-2 p-5 sm:p-6 animate-fade-in',
              )}
              style={{
                borderColor: `rgb(${themeRgb.primary} / 0.4)`,
                background: `linear-gradient(135deg, rgb(${themeRgb.primary}/0.12), rgb(${themeRgb.secondary}/0.18))`,
              }}
            >
              {/* Decorative blob */}
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20"
                style={{ backgroundColor: `rgb(${themeRgb.primary})` }}
              />
              <div
                className="pointer-events-none absolute -bottom-6 left-12 h-20 w-20 rounded-full opacity-10"
                style={{ backgroundColor: `rgb(${themeRgb.secondary})` }}
              />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-md animate-float select-none"
                    style={{ backgroundColor: `rgb(${themeRgb.primary})` }}
                  >
                    🚀
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Parent controls
                    </p>
                    <p className="text-lg font-black text-foreground">Launch for your child</p>
                    <p className="text-sm text-muted-foreground">
                      Opens the fun kid-friendly study player
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  size="lg"
                  className={cn(
                    'shrink-0 gap-2 rounded-2xl px-6 font-black text-white',
                    'shadow-lg hover:opacity-90 hover:scale-105 transition-all duration-200',
                  )}
                  style={{
                    background: `linear-gradient(135deg, rgb(${themeRgb.primary}), rgb(${themeRgb.secondary}))`,
                  }}
                >
                  <Link to={`/study/${studyId}/play`}>
                    <Rocket className="h-5 w-5" />
                    Start Study Session
                    <Play className="h-4 w-4 fill-current" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* ── Progress bar ───────────────────────────── */}
            <div className="animate-fade-in" style={{ animationDelay: '80ms' }}>
              <GamifiedProgressBar
                gamification={customization.gamification ?? DEFAULT_GAMIFICATION}
                themeRgb={themeRgb}
              />
            </div>

            {/* ── Content tabs ───────────────────────────── */}
            <Tabs defaultValue="summary" className="w-full animate-fade-in" style={{ animationDelay: '120ms' } as React.CSSProperties}>
              <TabsList className="mb-5 grid w-full grid-cols-2 rounded-2xl sm:grid-cols-4">
                <TabsTrigger value="summary" className="gap-1.5 rounded-xl text-xs sm:text-sm">
                  <FileText className="h-3.5 w-3.5" aria-hidden />
                  Summary
                </TabsTrigger>
                <TabsTrigger value="lessons" className="gap-1.5 rounded-xl text-xs sm:text-sm">
                  <BookOpen className="h-3.5 w-3.5" aria-hidden />
                  Lessons
                </TabsTrigger>
                <TabsTrigger value="flashcards" className="gap-1.5 rounded-xl text-xs sm:text-sm">
                  <Layers className="h-3.5 w-3.5" aria-hidden />
                  Flashcards
                </TabsTrigger>
                <TabsTrigger value="quizzes" className="gap-1.5 rounded-xl text-xs sm:text-sm">
                  <HelpCircle className="h-3.5 w-3.5" aria-hidden />
                  Quizzes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-0">
                <GamifiedSummaryTab summaryText={summary} themeRgb={themeRgb} />
              </TabsContent>
              <TabsContent value="lessons" className="mt-0">
                <GamifiedLessonsTab lessons={lessons} themeRgb={themeRgb} />
              </TabsContent>
              <TabsContent value="flashcards" className="mt-0">
                <GamifiedFlashcardsTab cards={cards} themeRgb={themeRgb} />
              </TabsContent>
              <TabsContent value="quizzes" className="mt-0">
                <GamifiedQuizzesTab quizzes={quizzes} themeRgb={themeRgb} />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* ── Customization sidebar (desktop) ─────────── */}
        {showCustomization && (
          <aside className={cn('hidden shrink-0 flex-col overflow-hidden md:flex', 'w-full md:w-80 lg:w-96')}>
            <ParentCustomizationPanel
              customization={customization}
              onCustomizationChange={handleCustomizationChange}
            />
          </aside>
        )}
      </div>

      {/* ── Customization sheet (mobile) ─────────────── */}
      <Sheet
        open={showCustomization && isMobile}
        onOpenChange={(open) => !open && setShowCustomization(false)}
      >
        <SheetContent side="right" className="w-full max-w-sm p-0 md:hidden" showCloseButton>
          <div className="h-full overflow-auto pt-14">
            <ParentCustomizationPanel
              customization={customization}
              onCustomizationChange={handleCustomizationChange}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
