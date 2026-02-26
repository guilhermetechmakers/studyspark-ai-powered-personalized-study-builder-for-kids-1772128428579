/**
 * ProtectedRoute - Redirects unauthenticated users to login.
 * Shows loading skeleton while auth state is resolving.
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContextOptional } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

export interface ProtectedRouteProps {
  children: React.ReactNode
  /** Redirect path when not authenticated. Default: /login */
  redirectTo?: string
  className?: string
}

export function ProtectedRoute({
  children,
  redirectTo = '/login',
  className,
}: ProtectedRouteProps) {
  const auth = useAuthContextOptional()
  const location = useLocation()

  if (!auth) {
    return <>{children}</>
  }

  if (auth.isLoading) {
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
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    )
  }

  if (!auth.isAuthenticated || !auth.user) {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    return (
      <Navigate
        to={`${redirectTo}${returnUrl ? `?redirect=${returnUrl}` : ''}`}
        state={{ from: location }}
        replace
      />
    )
  }

  return <>{children}</>
}
