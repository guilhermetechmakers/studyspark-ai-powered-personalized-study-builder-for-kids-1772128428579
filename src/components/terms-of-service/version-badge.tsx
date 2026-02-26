import * as React from 'react'
import { cn } from '@/lib/utils'

export interface VersionBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  version: string
  effectiveDate: string
  locale?: string
}

export function VersionBadge({
  version,
  effectiveDate,
  locale = 'en-US',
  className,
  ...props
}: VersionBadgeProps) {
  const formattedDate = React.useMemo(() => {
    try {
      const date = new Date(effectiveDate)
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return effectiveDate
    }
  }, [effectiveDate, locale])

  return (
    <div
      role="status"
      aria-label={`Terms of Service version ${version}, effective ${formattedDate}`}
      className={cn(
        'inline-flex items-center gap-2 rounded-full bg-[rgb(var(--peach-light))]/60 px-3 py-1.5 text-xs font-medium text-foreground/90 border border-[rgb(var(--peach))]/30',
        className
      )}
      {...props}
    >
      <span>v{version}</span>
      <span aria-hidden>•</span>
      <time dateTime={effectiveDate}>{formattedDate}</time>
    </div>
  )
}
