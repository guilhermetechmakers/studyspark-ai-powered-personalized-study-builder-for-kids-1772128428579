import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export type PillBadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'outline'

export interface PillBadgeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  variant?: PillBadgeVariant
  /** Optional Lucide icon to display before the label */
  icon?: LucideIcon
  /** Show skeleton placeholder while loading */
  isLoading?: boolean
  /** Content to display; empty content shows placeholder */
  children?: React.ReactNode
}

const variantMap: Record<PillBadgeVariant, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  default: 'default',
  success: 'success',
  warning: 'warning',
  destructive: 'destructive',
  outline: 'outline',
}

export function PillBadge({
  className,
  variant = 'default',
  icon: Icon,
  isLoading = false,
  'aria-label': ariaLabel,
  children,
  ...props
}: PillBadgeProps) {
  const displayText = typeof children === 'string' ? children : ''
  const isEmpty =
    children === null ||
    children === undefined ||
    (typeof children === 'string' && displayText.trim() === '')
  const label = ariaLabel ?? (displayText ? `Status: ${displayText}` : 'Status badge')

  if (isLoading) {
    return (
      <Skeleton
        className={cn(
          'inline-block h-6 w-16 rounded-full',
          'sm:h-6 sm:w-20',
          className
        )}
        aria-label="Loading"
      />
    )
  }

  return (
    <Badge
      role="status"
      aria-label={label}
      variant={variantMap[variant] ?? 'default'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        'shadow-sm transition-all duration-200',
        'hover:shadow-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'min-w-0',
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />}
      {isEmpty ? (
        <span className="text-muted-foreground">—</span>
      ) : (
        children
      )}
    </Badge>
  )
}
