import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export interface LoadingPanelProps {
  /** Whether the loading state is active */
  isLoading: boolean
  /** Primary message shown during loading (e.g. "Loading…") */
  message?: string
  /** Optional descriptive text below the message */
  description?: string
  /** Label for the optional cancel button */
  actionLabel?: string
  /** Optional callback when user cancels; when provided, cancel button is shown */
  onCancel?: () => void
  /** Optional number of skeleton rows to render (0 = no skeletons) */
  skeletonCount?: number
  /** Additional class names */
  className?: string
}

/**
 * LoadingPanel displays a spinner, optional message/description, optional skeletons,
 * and an optional cancel button for cancellable operations.
 */
export function LoadingPanel({
  isLoading,
  message = 'Loading…',
  description = '',
  actionLabel = 'Cancel',
  onCancel,
  skeletonCount = 0,
  className,
}: LoadingPanelProps) {
  if (!isLoading) return null

  const skeletons = Array.from(
    { length: Math.max(0, skeletonCount ?? 0) },
    (_, i) => i
  )

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-6 rounded-[1.25rem] bg-card/90 p-6 sm:p-8',
        'border border-border/80 shadow-card backdrop-blur-sm',
        'bg-gradient-to-b from-[rgb(var(--peach-light))]/30 to-card/90',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2
          className="h-10 w-10 animate-spin text-primary"
          aria-hidden="true"
        />
        <div className="space-y-1 text-center">
          <p className="text-base font-medium text-foreground">{message}</p>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>

      {skeletons.length > 0 ? (
        <div className="w-full max-w-md space-y-3">
          {(skeletons ?? []).map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : null}

      {typeof onCancel === 'function' ? (
        <Button variant="outline" size="sm" onClick={onCancel}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
