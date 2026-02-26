/**
 * RetryButton - Prominent CTA to retry the previous action.
 * Shows loading spinner when clicked; performs reload or re-fetch as fallback.
 */

import { useState, useCallback } from 'react'
import { RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface RetryButtonProps {
  className?: string
  onRetry?: () => Promise<void> | void
}

export function RetryButton({ className, onRetry }: RetryButtonProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = useCallback(async () => {
    if (isRetrying) return
    setIsRetrying(true)
    try {
      if (typeof onRetry === 'function') {
        await onRetry()
        setIsRetrying(false)
      } else {
        try {
          const referrer = document.referrer
          const isSameOrigin = referrer && new URL(referrer).origin === window.location.origin
          const isNot500 = referrer && !referrer.includes('/500')
          if (isSameOrigin && isNot500) {
            window.location.href = referrer
            return
          }
        } catch {
          /* referrer may be invalid; fall through to reload */
        }
        window.location.reload()
      }
    } catch {
      window.location.reload()
    }
  }, [isRetrying, onRetry])

  return (
    <Button
      type="button"
      variant="default"
      size="lg"
      onClick={handleRetry}
      disabled={isRetrying}
      className={cn(
        'rounded-full shadow-md hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] transition-all duration-200',
        className
      )}
      aria-label={isRetrying ? 'Retrying, please wait' : 'Retry the previous action'}
      aria-busy={isRetrying}
    >
      {isRetrying ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          <span>Retrying…</span>
        </>
      ) : (
        <>
          <RefreshCw className="h-5 w-5" aria-hidden />
          <span>Retry</span>
        </>
      )}
    </Button>
  )
}
