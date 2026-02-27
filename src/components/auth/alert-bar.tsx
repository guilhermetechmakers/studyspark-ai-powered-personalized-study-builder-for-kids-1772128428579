import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
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

const VARIANT_LABELS: Record<AlertVariant, string> = {
  error: 'Error',
  success: 'Success',
  info: 'Information',
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
  const isInfo = resolvedVariant === 'info'

  const variantLabel = VARIANT_LABELS[resolvedVariant]
  const ariaLabel = `${variantLabel}: ${message}`

  return (
    <div
      role="alert"
      aria-live={ariaLive}
      aria-label={ariaLabel}
      className={cn(
        'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm',
        'transition-shadow duration-200',
        isError &&
          'border-destructive/50 bg-destructive/10 text-destructive shadow-sm',
        isSuccess &&
          'border-success/50 bg-success/10 text-success-foreground shadow-sm',
        isInfo &&
          'border-info/50 bg-info/10 text-info-foreground shadow-sm',
        className
      )}
    >
      {isError && (
        <AlertCircle
          className="h-4 w-4 shrink-0 text-destructive"
          aria-hidden
        />
      )}
      {isSuccess && (
        <CheckCircle2
          className="h-4 w-4 shrink-0 text-success-foreground"
          aria-hidden
        />
      )}
      {isInfo && (
        <Info className="h-4 w-4 shrink-0 text-info-foreground" aria-hidden />
      )}
      <span className="font-medium">{message}</span>
    </div>
  )
}
