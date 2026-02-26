/**
 * PermissionsBadge - Shows current user's permissions (parent/teacher).
 * Design: playful, rounded, pastel gradients per StudySpark design system.
 */

import { Shield, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/study-review'

export interface PermissionsBadgeProps {
  role: UserRole
  className?: string
}

const ROLE_CONFIG: Record<UserRole, { label: string; icon: typeof User; className: string }> = {
  parent: {
    label: 'Parent',
    icon: User,
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  teacher: {
    label: 'Teacher',
    icon: Shield,
    className: 'bg-accent/20 text-accent-foreground border-accent/30',
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    className: 'bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/30',
  },
}

export function PermissionsBadge({ role, className }: PermissionsBadgeProps) {
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.parent
  const Icon = config.icon

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
        config.className,
        className
      )}
      role="status"
      aria-label={`Role: ${config.label}`}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {config.label}
    </div>
  )
}
