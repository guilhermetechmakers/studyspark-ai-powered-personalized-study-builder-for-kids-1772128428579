import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AlertVariant = 'error' | 'success' | 'info'

export interface AlertBarProps {
  message: string
  variant?: AlertVariant
  /** @deprecated Use variant instead */
  type?: 'error' | 'success'
  className?: string
  'aria-live'?: 'polite' | 'assertive'
}

export function AlertBar({
  message,
  variant,
  type,
  className,
  'aria-live': ariaLive = 'assertive',
}: AlertBarProps) {
  const resolvedVariant = variant ?? (type === 'success' ? 'success' : 'error')
  if (!message) return null

  const isError = resolvedVariant === 'error'
  const isSuccess = resolvedVariant === 'success'

  return (
    <div
      role="alert"
      aria-live={ariaLive}
      className={cn(
        'flex items-center gap-3 rounded-xl border px-4 py-3 text-sm',
        isError && 'border-destructive/50 bg-destructive/10 text-destructive',
        isSuccess && 'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400',
        resolvedVariant === 'info' && 'border-primary/50 bg-primary/10 text-primary',
        className
      )}
    >
      {isError && <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />}
      {isSuccess && <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />}
      <span>{message}</span>
    </div>
  )
}
