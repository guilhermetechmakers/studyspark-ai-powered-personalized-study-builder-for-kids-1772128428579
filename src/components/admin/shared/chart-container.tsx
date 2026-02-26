import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
}

export function ChartContainer({ title, className, children, ...props }: ChartContainerProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover',
        className
      )}
      {...props}
    >
      {title && <h3 className="mb-4 text-lg font-semibold text-foreground">{title}</h3>}
      <div className="h-[280px] w-full min-w-0">{children}</div>
    </div>
  )
}
