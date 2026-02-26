import * as React from 'react'
import { cn } from '@/lib/utils'

export interface PillBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline'
}

const variantStyles: Record<string, string> = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
  warning: 'bg-amber-500/20 text-amber-700 dark:text-amber-400',
  destructive: 'bg-destructive/20 text-destructive',
  outline: 'border border-border bg-transparent',
}

export function PillBadge({ className, variant = 'default', ...props }: PillBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        variantStyles[variant] ?? variantStyles.default,
        className
      )}
      {...props}
    />
  )
}
