import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const variantMap = {
  active: 'success',
  inactive: 'outline',
  suspended: 'warning',
  deleted: 'destructive',
  pending: 'warning',
  approved: 'success',
  banned: 'destructive',
  changes_requested: 'secondary',
  low: 'secondary',
  medium: 'warning',
  high: 'destructive',
  critical: 'destructive',
  info: 'default',
  warn: 'warning',
  error: 'destructive',
  debug: 'outline',
} as const

export interface PillBadgeProps {
  value: string
  variant?: keyof typeof variantMap
  className?: string
}

export function PillBadge({ value, variant, className }: PillBadgeProps) {
  const badgeVariant = variant ?? (variantMap[value as keyof typeof variantMap] ?? 'default')
  return (
    <Badge
      variant={badgeVariant as 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'}
      className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', className)}
    >
      {value}
    </Badge>
  )
}
