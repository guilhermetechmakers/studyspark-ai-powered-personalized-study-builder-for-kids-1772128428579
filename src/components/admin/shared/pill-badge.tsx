import * as React from 'react'
import { cn } from '@/lib/utils'

export interface PillBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline'
}

/** Design tokens: uses CSS variables for colors per design system */
const variantStyles: Record<string, string> = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-[rgb(var(--success))]/20 text-[rgb(var(--success-foreground))]',
  warning: 'bg-[rgb(var(--warning))]/20 text-[rgb(var(--warning-foreground))]',
  destructive: 'bg-destructive/20 text-destructive',
  outline: 'border border-border bg-transparent',
}

export function PillBadge({
  className,
  variant = 'default',
  'aria-label': ariaLabel,
  children,
  ...props
}: PillBadgeProps) {
  const displayText = typeof children === 'string' ? children : ''
  const label = ariaLabel ?? (displayText ? `Status: ${displayText}` : 'Status badge')
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium shadow-sm transition-shadow',
        'hover:shadow-card',
        variantStyles[variant] ?? variantStyles.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
