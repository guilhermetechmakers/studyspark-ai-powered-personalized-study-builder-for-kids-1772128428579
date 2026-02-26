import * as React from 'react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  children: React.ReactNode
  icon?: LucideIcon
}

function toSectionId(title: string): string {
  return title.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '')
}

export function SectionCard({ title, children, icon: Icon, className, ...props }: SectionCardProps) {
  const sectionId = toSectionId(title)
  return (
    <article
      id={sectionId}
      className={cn(
        'rounded-[20px] border border-border/60 bg-gradient-to-br from-[rgb(var(--peach-light))]/40 via-white to-[rgb(var(--lavender))]/20 p-6 md:p-8 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
      aria-labelledby={`${sectionId}-heading`}
      {...props}
    >
      <div className="mb-4 flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
        )}
        <h2
          id={`${sectionId}-heading`}
          className="text-xl font-bold text-foreground md:text-2xl"
        >
          {title}
        </h2>
      </div>
      <div className="space-y-4 text-base text-foreground/90">{children}</div>
    </article>
  )
}
