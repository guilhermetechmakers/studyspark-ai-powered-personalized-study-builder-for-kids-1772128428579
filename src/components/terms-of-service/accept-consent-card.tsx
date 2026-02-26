/**
 * AcceptConsentCard - Prominent container for ToS acceptance during onboarding.
 * Includes Accept button and optional Decline/Cancel action.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface AcceptConsentCardProps {
  summary?: string
  onAccept: () => void | Promise<void>
  onDecline?: () => void
  requireScrollToBottom?: boolean
  isLoading?: boolean
  className?: string
}

export function AcceptConsentCard({
  summary = 'By clicking Accept, you agree to our Terms of Service and acknowledge that you have read and understood them.',
  onAccept,
  onDecline,
  requireScrollToBottom = false,
  isLoading = false,
  className,
}: AcceptConsentCardProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(!requireScrollToBottom)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAccept = async () => {
    if (requireScrollToBottom && !hasScrolledToBottom) return
    if (isLoading || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onAccept()
    } finally {
      setIsSubmitting(false)
    }
  }

  const canAccept = hasScrolledToBottom && !isLoading && !isSubmitting

  return (
    <Card
      className={cn(
        'rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-[rgb(var(--peach-light))]/50 to-[rgb(var(--lavender))]/30',
        'shadow-card transition-all duration-300 hover:shadow-card-hover',
        className
      )}
    >
      <CardHeader>
        <h3 className="text-lg font-bold text-foreground">
          Accept Terms of Service
        </h3>
        <p className="text-sm text-muted-foreground">{summary}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {requireScrollToBottom && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasScrolledToBottom}
              onChange={(e) => setHasScrolledToBottom(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-describedby="scroll-requirement-desc"
            />
            <span id="scroll-requirement-desc" className="text-sm text-muted-foreground">
              I have read and agree to the Terms of Service
            </span>
          </label>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button
            onClick={handleAccept}
            disabled={!canAccept}
            size="lg"
            className="rounded-full min-w-[120px]"
            aria-label="Accept Terms of Service"
          >
            {isSubmitting || isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-pulse rounded-full bg-current" />
                Accepting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="h-5 w-5" aria-hidden />
                Accept
              </span>
            )}
          </Button>
          {onDecline && (
            <Button
              variant="outline"
              onClick={onDecline}
              disabled={isSubmitting || isLoading}
              size="lg"
              className="rounded-full"
              aria-label="Decline and cancel"
            >
              Decline
            </Button>
          )}
          <Link
            to="/terms-of-service"
            className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Read full terms
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
