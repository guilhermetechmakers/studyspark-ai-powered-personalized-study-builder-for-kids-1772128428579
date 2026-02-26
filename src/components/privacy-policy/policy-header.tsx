import { cn } from '@/lib/utils'

export interface PolicyHeaderProps {
  title?: string
  lastUpdated?: string
  summary?: string
  className?: string
}

const DEFAULT_TITLE = 'Privacy Policy'
const DEFAULT_LAST_UPDATED = 'February 26, 2025'
const DEFAULT_SUMMARY =
  'StudySpark is committed to protecting your family\'s privacy. This policy explains how we collect, use, and safeguard information when you use our platform—with special attention to children\'s data and parental controls.'

export function PolicyHeader({
  title = DEFAULT_TITLE,
  lastUpdated = DEFAULT_LAST_UPDATED,
  summary = DEFAULT_SUMMARY,
  className,
}: PolicyHeaderProps) {
  return (
    <header
      className={cn(
        'rounded-3xl bg-gradient-to-br from-[rgb(var(--peach-light))] via-[rgb(var(--peach))]/80 to-[rgb(var(--lavender))]/30 p-8 md:p-12',
        className
      )}
      aria-labelledby="policy-title"
    >
      <div className="space-y-4">
        <h1 id="policy-title" className="text-3xl font-bold text-foreground md:text-4xl">
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
