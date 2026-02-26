import { CheckCircle2 } from 'lucide-react'
import { BulletList } from './bullet-list'

const DEFAULT_ACTIONS = [
  'Create an account and accept this Privacy Policy to use StudySpark.',
  'Add child profiles only after reviewing and agreeing to our data practices.',
  'Manage consent and data in your account settings at any time.',
  'Contact us at privacy@studyspark.com to withdraw consent or request deletion.',
]

export interface ConsentSummaryCardProps {
  actions?: string[]
  onConsentClick?: () => void
  className?: string
}

export function ConsentSummaryCard({
  actions = DEFAULT_ACTIONS,
  onConsentClick,
  className,
}: ConsentSummaryCardProps) {
  const safeActions = Array.isArray(actions) ? actions : DEFAULT_ACTIONS

  return (
    <article
      className={`
        rounded-[24px] border-2 border-primary/20 bg-gradient-to-br from-[rgb(var(--lavender))]/30 via-white to-[rgb(var(--peach-light))]/40 p-6 md:p-8 shadow-card
        transition-all duration-300 hover:shadow-card-hover
        ${className ?? ''}
      `}
      aria-labelledby="consent-summary-title"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <CheckCircle2 className="h-6 w-6" aria-hidden />
        </div>
        <h2 id="consent-summary-title" className="text-xl font-bold text-foreground md:text-2xl">
          Parental Actions Summary
        </h2>
      </div>
      <p className="mb-4 text-base leading-relaxed text-foreground/90">
        As a parent, here is what you need to know and do:
      </p>
      <BulletList items={safeActions} />
      {onConsentClick && (
        <button
          type="button"
          onClick={onConsentClick}
          className="mt-6 rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Manage consent preferences"
        >
          Manage Consent Preferences
        </button>
      )}
    </article>
  )
}
