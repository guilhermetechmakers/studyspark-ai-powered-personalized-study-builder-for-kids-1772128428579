'use client'

import { Star, Award, Flame, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { StudyGamification } from '@/types/study-customization'

interface GamificationPanelEditorProps {
  gamification: StudyGamification
  onGamificationChange: (g: Partial<StudyGamification>) => void
  disabled?: boolean
  className?: string
}

const BADGE_OPTIONS = [
  'First Steps',
  'Quick Learner',
  'Star Student',
  'Perfect Score',
  'Streak Master',
  'Completion Champion',
]

export function GamificationPanelEditor({
  gamification,
  onGamificationChange,
  disabled = false,
  className,
}: GamificationPanelEditorProps) {
  const score = gamification.score ?? 0
  const level = gamification.level ?? 1
  const badges = Array.isArray(gamification.badges) ? gamification.badges : []

  const pointsToNextLevel = Math.max(1, level * 100)
  const progressInLevel = score % pointsToNextLevel
  const progressPercent = Math.min(100, (progressInLevel / pointsToNextLevel) * 100)

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" aria-hidden />
        <h3 className="font-semibold text-foreground">Gamification</h3>
      </div>

      <div className="rounded-2xl border border-border bg-gradient-to-br from-[rgb(var(--peach-light))]/30 to-[rgb(var(--lavender))]/20 p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              Level {level}
            </span>
          </div>
          <Progress value={progressPercent} className="mt-2 h-2" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-2 rounded-xl bg-card/80 p-3 shadow-sm">
            <Star className="h-5 w-5 text-[rgb(var(--tangerine))]" aria-hidden />
            <div>
              <p className="text-xl font-bold">{score}</p>
              <p className="text-xs text-muted-foreground">Points</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-card/80 p-3 shadow-sm">
            <Flame className="h-5 w-5 text-[rgb(var(--coral))]" aria-hidden />
            <div>
              <p className="text-xl font-bold">{level}</p>
              <p className="text-xs text-muted-foreground">Level</p>
            </div>
          </div>
        </div>
      </div>

      {!disabled && (
        <div className="space-y-3">
          <Label className="text-sm text-muted-foreground">
            Adjust points (for testing)
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              value={score}
              onChange={(e) =>
                onGamificationChange({
                  score: Math.max(0, parseInt(e.target.value, 10) || 0),
                })
              }
              className="w-24"
              aria-label="Points"
            />
            <Input
              type="number"
              min={1}
              value={level}
              onChange={(e) =>
                onGamificationChange({
                  level: Math.max(1, parseInt(e.target.value, 10) || 1),
                })
              }
              className="w-24"
              aria-label="Level"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Badges earned</Label>
        <div className="flex flex-wrap gap-2">
          {badges.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No badges yet. Complete activities to earn them!
            </p>
          ) : (
            badges.map((badge, i) => (
              <span
                key={`${badge}-${i}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                <Award className="h-3.5 w-3" aria-hidden />
                {badge}
              </span>
            ))
          )}
        </div>
      </div>

      {!disabled && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            Add badge (demo)
          </Label>
          <div className="flex flex-wrap gap-2">
            {BADGE_OPTIONS.filter((b) => !badges.includes(b)).map((badge) => (
              <Button
                key={badge}
                variant="outline"
                size="sm"
                onClick={() =>
                  onGamificationChange({
                    badges: [...badges, badge],
                  })
                }
                className="text-xs"
              >
                + {badge}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
