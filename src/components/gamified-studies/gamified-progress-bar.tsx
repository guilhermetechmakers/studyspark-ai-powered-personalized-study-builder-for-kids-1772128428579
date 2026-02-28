'use client'

import { Star, Award, Flame, Clock } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { StudyGamification } from '@/types/study-customization'

interface GamifiedProgressBarProps {
  gamification: StudyGamification
  themeRgb?: { primary: string }
  className?: string
}

export function GamifiedProgressBar({
  gamification,
  themeRgb,
  className,
}: GamifiedProgressBarProps) {
  const primary = themeRgb?.primary ?? '91 87 165'
  const score = gamification.score ?? 0
  const level = gamification.level ?? 1
  const badges = Array.isArray(gamification.badges) ? gamification.badges : []

  const pointsToNextLevel = level * 100
  const progressInLevel = score % pointsToNextLevel
  const progressPercent =
    pointsToNextLevel > 0
      ? Math.min(100, (progressInLevel / pointsToNextLevel) * 100)
      : 0

  return (
    <div
      className={cn(
        'rounded-2xl border border-border p-4',
        'bg-gradient-to-br from-[rgb(var(--peach-light))]/30 to-[rgb(var(--lavender))]/20',
        className
      )}
      style={{
        borderColor: `rgb(${primary} / 0.2)`,
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Level {level}
        </span>
        <span className="text-xs text-muted-foreground">
          {score} pts · Next: {pointsToNextLevel}
        </span>
      </div>
      <Progress value={progressPercent} className="h-2" />

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-2 rounded-xl bg-card/80 p-2 shadow-sm">
          <Star
            className="h-4 w-4 shrink-0"
            style={{ color: `rgb(var(--tangerine))` }}
            aria-hidden
          />
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">{score}</p>
            <p className="text-xs text-muted-foreground">Points</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-card/80 p-2 shadow-sm">
          <Flame
            className="h-4 w-4 shrink-0"
            style={{ color: `rgb(var(--coral))` }}
            aria-hidden
          />
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">{level}</p>
            <p className="text-xs text-muted-foreground">Level</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-card/80 p-2 shadow-sm">
          <Award
            className="h-4 w-4 shrink-0 text-primary"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">{badges.length}</p>
            <p className="text-xs text-muted-foreground">Badges</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-card/80 p-2 shadow-sm">
          <Clock className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">—</p>
            <p className="text-xs text-muted-foreground">Time</p>
          </div>
        </div>
      </div>

      {badges.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Badges earned
          </p>
          <div className="flex flex-wrap gap-1.5">
            {badges.slice(0, 5).map((badge, i) => (
              <span
                key={`${badge}-${i}`}
                className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
              >
                {badge}
              </span>
            ))}
            {badges.length > 5 && (
              <span className="text-xs text-muted-foreground">
                +{badges.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
