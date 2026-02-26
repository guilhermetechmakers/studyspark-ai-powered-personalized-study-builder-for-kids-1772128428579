import { useMemo } from 'react'
import { cn } from '@/lib/utils'

export type PasswordStrength = 0 | 1 | 2 | 3 | 4

const STRENGTH_LABELS: Record<PasswordStrength, string> = {
  0: 'Enter a password',
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Strong',
}

const STRENGTH_COLORS: Record<PasswordStrength, string> = {
  0: 'bg-muted',
  1: 'bg-destructive',
  2: 'bg-amber-500',
  3: 'bg-primary',
  4: 'bg-green-600',
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password || password.length === 0) return 0
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  return Math.min(4, Math.max(1, Math.ceil(score / 1.25))) as PasswordStrength
}

export interface PasswordStrengthMeterProps {
  password: string
  className?: string
  showLabel?: boolean
}

export function PasswordStrengthMeter({
  password,
  className,
  showLabel = true,
}: PasswordStrengthMeterProps) {
  const strength = useMemo(() => getPasswordStrength(password ?? ''), [password])
  const percent = strength * 25
  const label = STRENGTH_LABELS[strength]

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full transition-all duration-300', STRENGTH_COLORS[strength])}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Password strength: ${label}`}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {label}
        </p>
      )}
    </div>
  )
}
