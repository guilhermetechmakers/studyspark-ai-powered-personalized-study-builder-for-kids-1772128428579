import { useEffect } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ErrorBannerProps {
  message: string
  onDismiss?: () => void
  onRetry?: () => void
  autoHideAfterMs?: number
  className?: string
}

export function ErrorBanner({
  message,
  onDismiss,
  onRetry,
  autoHideAfterMs = 8000,
  className,
}: ErrorBannerProps) {
  useEffect(() => {
    if (autoHideAfterMs > 0 && onDismiss) {
      const t = setTimeout(onDismiss, autoHideAfterMs)
      return () => clearTimeout(t)
    }
  }, [autoHideAfterMs, onDismiss])

  return (
    <div
      role="alert"
      className={cn(
        'flex items-center justify-between gap-4 rounded-xl border-2 border-destructive/50 bg-destructive/10 p-4 animate-fade-in',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 shrink-0 text-destructive" aria-hidden />
        <p className="text-sm font-medium text-destructive">{message}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="rounded-full border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            Retry
          </Button>
        )}
        {onDismiss && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="rounded-full"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
