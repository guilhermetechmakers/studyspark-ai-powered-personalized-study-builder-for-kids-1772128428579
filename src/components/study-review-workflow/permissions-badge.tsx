import { Shield, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/review-workflow'

export interface PermissionsBadgeProps {
  role: UserRole
  className?: string
}

const ROLE_LABELS: Record<UserRole, string> = {
  parent: 'Parent',
  teacher: 'Teacher',
  admin: 'Admin',
}

export function PermissionsBadge({ role, className }: PermissionsBadgeProps) {
  const isTeacher = role === 'teacher'

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        'bg-gradient-to-r from-[rgb(var(--peach-light))]/40 to-[rgb(var(--lavender))]/30',
        'border border-border/60',
        className
      )}
      aria-label={`Role: ${ROLE_LABELS[role]}`}
    >
      {isTeacher ? (
        <Shield className="h-3.5 w-3.5 text-primary" />
      ) : (
        <User className="h-3.5 w-3.5 text-primary" />
      )}
      <span className="text-foreground">{ROLE_LABELS[role]}</span>
    </div>
  )
}
