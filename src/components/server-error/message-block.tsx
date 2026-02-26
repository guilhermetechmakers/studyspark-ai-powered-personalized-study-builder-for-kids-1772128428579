/**
 * MessageBlock - Headline, subheading, and explanatory text for 500 error.
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface MessageBlockProps {
  className?: string
}

export function MessageBlock({ className }: MessageBlockProps) {
  return (
    <section
      className={cn('text-center space-y-4', className)}
      aria-labelledby="server-error-heading"
    >
      <StatusBadge />
      <h1
        id="server-error-heading"
        className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
      >
        Oops, something went wrong
      </h1>
      <p className="text-lg text-muted-foreground sm:text-xl">
        We&apos;re sorry — we hit a temporary snag on our end.
      </p>
      <p className="text-base text-muted-foreground max-w-md mx-auto">
        This is usually brief. Please try again in a moment. If the problem
        persists, our team is here to help.
      </p>
    </section>
  )
}

function StatusBadge() {
  return (
    <Badge
      variant="secondary"
      className="rounded-full px-4 py-1.5 text-sm font-medium bg-secondary/30 text-secondary-foreground"
      aria-label="Status: Temporary issue"
    >
      Temporary Issue
    </Badge>
  )
}
