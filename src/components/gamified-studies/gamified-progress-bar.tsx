'use client'

import { Star, Zap, Trophy, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StudyGamification } from '@/types/study-customization'

interface GamifiedProgressBarProps {
  gamification: StudyGamification
  themeRgb?: { primary: string }
  className?: string
}

const LEVEL_GRADIENTS = [
  'from-slate-400  to-slate-300',
  'from-emerald-500 to-green-400',
  'from-blue-500   to-cyan-400',
  'from-violet-500 to-purple-400',
  'from-orange-500 to-amber-400',
  'from-rose-500   to-pink-400',
]

const LEVEL_LABELS = ['Beginner', 'Explorer', 'Learner', 'Scholar', 'Champion', 'Legend']

function StatChip({
  icon,
  value,
  label,
  bg,
}: {
  icon: React.ReactNode
  value: number
  label: string
  bg: string
}) {
  return (
    <div className={cn('flex flex-col items-center gap-1 rounded-2xl p-2.5 text-center', bg)}>
      {icon}
      <span className="text-base font-black text-foreground leading-none">{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}

export function GamifiedProgressBar({
  gamification,
  themeRgb,
  className,
}: GamifiedProgressBarProps) {
  const primary = themeRgb?.primary ?? '91 87 165'
  const score   = gamification.score  ?? 0
  const level   = gamification.level  ?? 1
  const badges  = Array.isArray(gamification.badges) ? gamification.badges : []

  const pointsToNextLevel = level * 100
  const progressInLevel   = score % pointsToNextLevel
  const progressPercent   = pointsToNextLevel > 0
    ? Math.min(100, (progressInLevel / pointsToNextLevel) * 100)
    : 0

  const levelGradient = LEVEL_GRADIENTS[(level - 1) % LEVEL_GRADIENTS.length] ?? LEVEL_GRADIENTS[0]
  const levelLabel    = LEVEL_LABELS[(level - 1) % LEVEL_LABELS.length] ?? 'Hero'

  return (
    <div
      className={cn(
        'overflow-hidden rounded-3xl border-2 p-5',
        'bg-gradient-to-br from-card to-card/80',
        className,
      )}
      style={{ borderColor: `rgb(${primary} / 0.25)` }}
    >
      {/* Top row: animated level badge + quick stats */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl',
              'bg-gradient-to-br text-white shadow-lg animate-float',
              levelGradient,
            )}
            aria-label={`Level ${level}`}
          >
            <span className="text-xl font-black">{level}</span>
            <div className="absolute inset-0 rounded-2xl ring-2 ring-white/30" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Level {level}
            </p>
            <p className="text-lg font-black leading-tight text-foreground">
              {levelLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center rounded-2xl bg-amber-50 px-3 py-2 text-center dark:bg-amber-900/20">
            <Star className="mb-0.5 h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-black text-amber-700 dark:text-amber-400">{score}</span>
            <span className="text-[10px] text-amber-600/70">pts</span>
          </div>
          {badges.length > 0 && (
            <div className="flex flex-col items-center rounded-2xl bg-rose-50 px-3 py-2 text-center dark:bg-rose-900/20">
              <Flame className="mb-0.5 h-4 w-4 text-rose-500" />
              <span className="text-sm font-black text-rose-700 dark:text-rose-400">{badges.length}</span>
              <span className="text-[10px] text-rose-600/70">badges</span>
            </div>
          )}
        </div>
      </div>

      {/* XP bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Zap className="h-3.5 w-3.5" style={{ color: `rgb(${primary})` }} />
            XP to next level
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {progressInLevel} / {pointsToNextLevel}
          </span>
        </div>

        <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${progressPercent}%`,
              background: `linear-gradient(90deg, rgb(${primary}), rgb(${primary} / 0.7))`,
            }}
          />
          {/* Shine overlay */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 60%)',
            }}
          />
        </div>

        <p className="text-right text-[11px] text-muted-foreground">
          {Math.round(progressPercent)}% to Level {level + 1}
        </p>
      </div>

      {/* Stat chips row */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <StatChip
          icon={<Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
          value={score}
          label="Points"
          bg="bg-amber-50 dark:bg-amber-900/20"
        />
        <StatChip
          icon={<Trophy className="h-4 w-4 text-violet-500" />}
          value={badges.length}
          label="Badges"
          bg="bg-violet-50 dark:bg-violet-900/20"
        />
        <StatChip
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          value={level}
          label="Level"
          bg="bg-orange-50 dark:bg-orange-900/20"
        />
      </div>

      {/* Badge chips */}
      {badges.length > 0 && (
        <div className="mt-4 border-t border-border/50 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            🏅 Earned badges
          </p>
          <div className="flex flex-wrap gap-2">
            {badges.slice(0, 6).map((badge, i) => (
              <span
                key={`${badge}-${i}`}
                className="inline-flex animate-pop items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                ⭐ {badge}
              </span>
            ))}
            {badges.length > 6 && (
              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                +{badges.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
