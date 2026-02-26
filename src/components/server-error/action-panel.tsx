/**
 * ActionPanel - Contains RetryButton and ContactSupportLink.
 */

import { RetryButton } from './retry-button'
import { ContactSupportLink } from './contact-support-link'
import { cn } from '@/lib/utils'

export interface ActionPanelProps {
  className?: string
  onRetry?: () => Promise<void> | void
}

export function ActionPanel({ className, onRetry }: ActionPanelProps) {
  return (
    <section
      className={cn('flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6', className)}
      aria-label="Actions"
    >
      <RetryButton onRetry={onRetry} />
      <ContactSupportLink variant="button" />
    </section>
  )
}
