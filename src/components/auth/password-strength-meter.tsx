import { useId, useMemo } from 'react'
import { cn } from '@/lib/utils'

export type PasswordStrength = 0 | 1 | 2 | 3 | 4

const STRENGTH_LABELS: Record<PasswordStrength, string> = {
  0: 'Enter a password',
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Strong',
}

/** Uses design tokens: muted, destructive, warning, primary, success */
const STRENGTH_COLORS: Record<PasswordStrength, string> = {
  0: 'bg-muted',
  1: 'bg-destructive',
  2: 'bg-warning',
  3: 'bg-primary',
  4: 'bg-success',
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
  const labelId = useId()
  const strength = useMemo(() => getPasswordStrength(password ?? ''), [password])
  const percent = strength * 25
  const label = STRENGTH_LABELS[strength]
  const accessibleLabel = `Password strength: ${label}`

  return (
    <div
      className={cn('space-y-1', className)}
      role="group"
      aria-labelledby={labelId}
    >
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-labelledby={labelId}
        aria-valuetext={accessibleLabel}
        className={cn(
          'flex h-2 w-full overflow-hidden rounded-full bg-muted transition-all duration-300',
          'min-h-[8px] sm:min-h-[10px]'
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            STRENGTH_COLORS[strength]
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span
        id={labelId}
        className={cn(
          'block text-xs text-muted-foreground',
          !showLabel && 'sr-only'
        )}
        aria-live="polite"
      >
        {accessibleLabel}
      </span>
    </div>
  )
}
