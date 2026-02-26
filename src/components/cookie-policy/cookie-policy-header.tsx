/**
 * CookiePolicyHeader - Page header with title and subheading.
 */
import { cn } from '@/lib/utils'

const DEFAULT_TITLE = 'Cookie Policy'
const DEFAULT_SUMMARY =
  'You control your cookie preferences. Choose which categories of cookies you allow, and update your choices anytime.'

export interface CookiePolicyHeaderProps {
  title?: string
  lastUpdated?: string
  summary?: string
  className?: string
}

export function CookiePolicyHeader({
  title = DEFAULT_TITLE,
  lastUpdated = 'February 26, 2025',
  summary = DEFAULT_SUMMARY,
  className,
}: CookiePolicyHeaderProps) {
  return (
    <header
      className={cn(
        'rounded-3xl bg-gradient-to-br from-[rgb(var(--peach-light))] via-[rgb(var(--peach))]/80 to-[rgb(var(--lavender))]/30 p-8 md:p-12',
        className
      )}
      aria-labelledby="cookie-policy-title"
    >
      <div className="space-y-4">
        <h1
          id="cookie-policy-title"
          className="text-3xl font-bold text-foreground md:text-4xl"
        >
          {title}
        </h1>
        <p className="text-sm font-medium text-foreground/80">
          Last updated: {lastUpdated}
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-foreground/90 md:text-lg">
          {summary}
        </p>
      </div>
    </header>
  )
}
