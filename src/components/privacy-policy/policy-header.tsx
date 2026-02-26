import * as React from 'react'
import { cn } from '@/lib/utils'

export interface PolicyHeaderProps {
  title: string
  lastUpdated: string
  summary?: string
  className?: string
}

export function PolicyHeader({ title, lastUpdated, summary, className }: PolicyHeaderProps) {
  return (
    <header
      className={cn(
        'space-y-4 rounded-3xl bg-gradient-to-br from-[rgb(var(--peach-light))] via-[rgb(var(--peach))]/80 to-[rgb(var(--lavender))]/30 p-8 md:p-12',
        className
      )}
      aria-labelledby="policy-title"
    >
      <h1 id="policy-title" className="text-3xl font-bold text-foreground md:text-4xl">
        {title}
      </h1>
      <p className="text-sm font-medium text-muted-foreground">
        Last updated: {lastUpdated}
      </p>
      {summary && (
        <p className="max-w-2xl text-base leading-relaxed text-foreground/90 md:text-lg">
          {summary}
        </p>
      )}
    </header>
  )
}
