/**
 * ErrorState - Shown when Study Library fails to load.
 * User-friendly message and retry CTA.
 */

import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  message = 'Something went wrong while loading your studies.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <Card
      className={cn(
        'border-destructive/30 bg-destructive/5',
        className
      )}
      data-testid="study-library-error-state"
    >
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" aria-hidden />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Failed to load studies
        </h3>
        <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
          {message}
        </p>
        {onRetry && (
          <Button
            variant="outline"
            className="mt-6"
            onClick={onRetry}
            aria-label="Retry loading studies"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
