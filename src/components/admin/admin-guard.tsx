/**
 * AdminGuard - RBAC guard for admin routes.
 * Redirects non-admin users to dashboard and shows forbidden for moderators without permission.
 */

import { Loader2 } from 'lucide-react'
import { Navigate, useLocation } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminRole } from '@/hooks/use-admin-role'
import { cn } from '@/lib/utils'

export interface AdminGuardProps {
  children: React.ReactNode
  /** Required permission (e.g. 'moderation:write'). If not set, any admin/moderator can access. */
  permission?: string
  /** Redirect path when not admin. Default: /dashboard */
  redirectTo?: string
  className?: string
}

export function AdminGuard({
  children,
  permission,
  redirectTo = '/dashboard',
  className,
}: AdminGuardProps) {
  const { isAdmin, isModerator, hasPermission, isLoading } = useAdminRole()
  const location = useLocation()

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex min-h-[50vh] items-center justify-center p-4 sm:p-6',
          className
        )}
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-atomic="true"
        aria-label="Verifying admin access. Please wait."
      >
        {/* Visually hidden message for screen readers - announced via aria-live */}
        <span className="sr-only">Verifying admin access. Please wait.</span>

        <div className="flex flex-col items-center gap-4">
          <Loader2
            className="h-10 w-10 animate-spin text-primary"
            aria-hidden
          />
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <p className="text-sm text-muted-foreground">Verifying access…</p>
          </div>
        </div>
      </div>
    )
  }

  // Not admin or moderator
  if (!isAdmin && !isModerator) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Permission check
  if (permission && !hasPermission(permission)) {
    return (
      <div
        className={cn(
          'flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8',
          className
        )}
      >
        <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
        <p className="text-center text-muted-foreground">
          You don&apos;t have permission to access this section.
        </p>
        <Navigate to="/admin" replace />
      </div>
    )
  }

  return <>{children}</>
}
