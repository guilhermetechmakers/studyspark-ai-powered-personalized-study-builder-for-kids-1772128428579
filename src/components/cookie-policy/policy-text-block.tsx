/**
 * PolicyTextBlock - Reusable text section with heading and body content.
 */
import { cn } from '@/lib/utils'

export interface PolicyTextBlockProps {
  id?: string
  title: string
  children: React.ReactNode
  className?: string
}

export function PolicyTextBlock({
  id,
  title,
  children,
  className,
}: PolicyTextBlockProps) {
  return (
    <section
      id={id}
      className={cn(
        'rounded-[20px] border border-border/60 bg-gradient-to-br from-[rgb(var(--peach-light))]/40 via-white to-[rgb(var(--lavender))]/20 p-6 md:p-8 shadow-card transition-all duration-300 hover:shadow-card-hover',
        className
      )}
      aria-labelledby={id ? `${id}-heading` : undefined}
    >
      <h2
        id={id ? `${id}-heading` : undefined}
        className="text-xl font-bold text-foreground md:text-2xl mb-4"
      >
        {title}
      </h2>
      <div className="space-y-3 text-base text-foreground/90 leading-relaxed">
        {children}
      </div>
    </section>
  )
}
