/**
 * AdminGuard - RBAC guard for admin routes.
 * Redirects non-admin users to dashboard and shows forbidden for moderators without permission.
 */

import { Navigate, useLocation } from 'react-router-dom'
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
          'flex min-h-[50vh] items-center justify-center',
          className
        )}
        role="status"
        aria-label="Loading"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-pulse rounded-full bg-primary/20" />
          <p className="text-sm text-muted-foreground">Verifying access…</p>
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
