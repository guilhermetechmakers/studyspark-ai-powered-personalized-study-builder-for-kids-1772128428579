'use client'

import { Sparkles, BookOpen, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GamifiedSummaryTabProps {
  summaryText: string
  themeRgb?: { primary: string; secondary: string; background: string }
  className?: string
}

export function GamifiedSummaryTab({
  summaryText,
  themeRgb,
  className,
}: GamifiedSummaryTabProps) {
  const primary   = themeRgb?.primary   ?? '91 87 165'
  const secondary = themeRgb?.secondary ?? '169 166 249'

  return (
    <div className={cn('space-y-5 animate-fade-in', className)}>
      {/* Hero mascot banner */}
      <div
        className="relative overflow-hidden rounded-3xl p-6"
        style={{
          background: `linear-gradient(135deg, rgb(${primary}/0.15), rgb(${secondary}/0.25))`,
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: `rgb(${primary}/0.25)`,
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20"
          style={{ backgroundColor: `rgb(${primary})` }}
        />
        <div
          className="absolute -bottom-4 left-8 h-16 w-16 rounded-full opacity-10"
          style={{ backgroundColor: `rgb(${secondary})` }}
        />

        <div className="relative flex items-center gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-md animate-float select-none"
            style={{ backgroundColor: `rgb(${primary})` }}
          >
            🦉
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Ready to learn?
            </p>
            <h3 className="text-xl font-black text-foreground">Study Overview</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Here's what this study is all about!
            </p>
          </div>
        </div>
      </div>

      {/* Summary content */}
      <div
        className="overflow-hidden rounded-3xl border-2"
        style={{
          borderColor: `rgb(${primary} / 0.2)`,
          boxShadow: `0 4px 20px rgb(${primary} / 0.08)`,
        }}
      >
        <div className="p-6 sm:p-8">
          {/* Section header */}
          <div className="mb-5 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `rgb(${primary} / 0.15)` }}
            >
              <BookOpen className="h-5 w-5" style={{ color: `rgb(${primary})` }} />
            </div>
            <div>
              <h4 className="font-bold text-foreground">What you'll learn</h4>
              <p className="text-xs text-muted-foreground">AI-generated summary</p>
            </div>
          </div>

          {/* Content */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: `linear-gradient(135deg, rgb(${secondary}/0.12), rgb(${primary}/0.06))`,
            }}
          >
            <p className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground leading-relaxed">
              {summaryText || 'No summary available yet. Create your study content to see a summary here.'}
            </p>
          </div>

          {/* Footer tip */}
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-2.5">
            <Lightbulb className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
            <p className="text-xs text-muted-foreground">
              Start with the <strong>Lessons</strong> tab, then test yourself with{' '}
              <strong>Flashcards</strong> and <strong>Quizzes</strong>!
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" aria-hidden />
        <span>Personalised by AI just for you</span>
      </div>
    </div>
  )
}
