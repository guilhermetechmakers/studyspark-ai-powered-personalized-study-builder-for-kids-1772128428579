import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  getPasswordStrength,
  getStrengthLabel,
  type PasswordStrength,
} from '@/lib/validation'

const STRENGTH_COLORS: Record<PasswordStrength, string> = {
  0: 'bg-muted',
  1: 'bg-destructive',
  2: 'bg-amber-500',
  3: 'bg-primary',
  4: 'bg-green-600',
}

export interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
  showLabel?: boolean
}

export function PasswordStrengthIndicator({
  password,
  className,
  showLabel = true,
}: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => getPasswordStrength(password ?? ''), [password])
  const percent = strength * 25
  const label = getStrengthLabel(strength)

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
