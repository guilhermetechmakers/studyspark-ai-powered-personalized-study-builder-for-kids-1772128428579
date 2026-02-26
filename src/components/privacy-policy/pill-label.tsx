import * as React from 'react'
import { cn } from '@/lib/utils'

export interface PillLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
}

export function PillLabel({ children, className, ...props }: PillLabelProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
