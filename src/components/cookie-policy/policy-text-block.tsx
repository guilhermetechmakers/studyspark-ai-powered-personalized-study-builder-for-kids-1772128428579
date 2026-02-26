import { cn } from '@/lib/utils'

export interface PolicyTextBlockProps {
  heading: string
  children: React.ReactNode
  id?: string
  className?: string
}

export function PolicyTextBlock({
  heading,
  children,
  id,
  className,
}: PolicyTextBlockProps) {
  const headingId = id ? `${id}-heading` : undefined
  return (
    <section
      id={id}
      className={cn('space-y-3', className)}
      aria-labelledby={headingId}
    >
      <h2
        id={headingId}
        className="text-lg font-semibold text-foreground md:text-xl"
      >
        {heading}
      </h2>
      <div className="text-base leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  )
}
