import { Loader2, CheckCircle, XCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StatusBadgeVariant = 'idle' | 'streaming' | 'complete' | 'error'

export interface StatusBadgeProps {
  variant: StatusBadgeVariant
  progressPct?: number
  stage?: string
  eta?: string
  className?: string
}

export function StatusBadge({
  variant,
  progressPct = 0,
  stage,
  eta,
  className,
}: StatusBadgeProps) {
  const label =
    variant === 'streaming'
      ? stage ?? 'Generating...'
      : variant === 'complete'
        ? 'Complete'
        : variant === 'error'
          ? 'Failed'
          : 'Ready'

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium',
        variant === 'streaming' && 'bg-primary/10 text-primary',
        variant === 'complete' && 'bg-success/20 text-success-foreground',
        variant === 'error' && 'bg-destructive/10 text-destructive',
        variant === 'idle' && 'bg-muted text-muted-foreground',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {variant === 'streaming' && (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
      )}
      {variant === 'complete' && (
        <CheckCircle className="h-4 w-4 shrink-0" aria-hidden />
      )}
      {variant === 'error' && (
        <XCircle className="h-4 w-4 shrink-0" aria-hidden />
      )}
      {variant === 'idle' && (
        <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
      )}
      <span>{label}</span>
      {variant === 'streaming' && progressPct > 0 && (
        <span className="text-xs opacity-80">{progressPct}%</span>
      )}
      {eta && variant === 'streaming' && (
        <span className="text-xs opacity-70">~{eta}</span>
      )}
    </div>
  )
}
