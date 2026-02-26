'use client'

import { Star, Award, Flame, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProgressData } from '@/types/study-viewer'

interface GamificationPanelProps {
  stats: ProgressData | null | undefined
  className?: string
}

export function GamificationPanel({ stats: statsProp, className }: GamificationPanelProps) {
  const stats = statsProp ?? {
    total: 0,
    completed: 0,
    stars: 0,
    timeSpent: 0,
    streak: 0,
    badges: [],
  }

  const stars = stats.stars ?? 0
  const streak = stats.streak ?? 0
  const timeSpent = stats.timeSpent ?? 0
  const badges = Array.isArray(stats.badges) ? stats.badges : []

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }

  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-gradient-to-br from-[rgb(var(--peach-light))]/30 to-[rgb(var(--lavender))]/20 p-4',
        className
      )}
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-xl bg-card/80 p-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgb(var(--tangerine))]/20">
            <Star className="h-5 w-5 text-[rgb(var(--tangerine))]" aria-hidden />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stars}</p>
            <p className="text-xs text-muted-foreground">Stars</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-card/80 p-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgb(var(--coral))]/20">
            <Flame className="h-5 w-5 text-[rgb(var(--coral))]" aria-hidden />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{streak}</p>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-card/80 p-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
            <Clock className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{formatTime(timeSpent)}</p>
            <p className="text-xs text-muted-foreground">Time</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-card/80 p-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgb(var(--lavender))]/30">
            <Award className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{badges.length}</p>
            <p className="text-xs text-muted-foreground">Badges</p>
          </div>
        </div>
      </div>

      {badges.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-foreground">Badges earned</p>
          <div className="flex flex-wrap gap-2">
            {(badges ?? []).map((badge, i) => (
              <span
                key={`${badge}-${i}`}
                className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
