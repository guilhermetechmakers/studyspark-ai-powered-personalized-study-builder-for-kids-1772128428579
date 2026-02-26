/**
 * Terms of Service page - Public access at /terms-of-service.
 * Renders full ToS content with TOC and accessible navigation.
 */
import { ToSPageContainer } from '@/components/terms-of-service'
import { TOS_CONTENT } from '@/data/terms-of-service-content'

export function TermsOfServicePage() {
  const content = TOS_CONTENT ?? { version: '1.0', effectiveDate: '', sections: [] }

  return (
    <ToSPageContainer
      content={content}
      locale="en-US"
    />
  )
}
