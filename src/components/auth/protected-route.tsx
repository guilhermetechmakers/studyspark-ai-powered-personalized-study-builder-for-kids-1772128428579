/**
 * ProtectedRoute - Redirects unauthenticated users to login.
 * Shows loading skeleton while auth state is resolving.
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContextOptional } from '@/contexts/auth-context'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface ProtectedRouteProps {
  children: React.ReactNode
  /** Redirect path when not authenticated. Default: /login */
  redirectTo?: string
  className?: string
}

/**
 * Skeleton layout mimicking dashboard structure (sidebar + header + main content).
 * Provides visual continuity while auth resolves.
 */
function ProtectedRouteLoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-screen min-h-[50vh] overflow-hidden bg-background',
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-atomic="true"
      aria-label="Loading your dashboard. Please wait."
    >
      {/* Visually hidden message for screen readers - announced via aria-live */}
      <span className="sr-only">Loading your dashboard. Please wait.</span>

      {/* Sidebar skeleton */}
      <aside
        className="hidden w-16 shrink-0 flex-col gap-4 border-r border-border bg-card p-4 md:flex md:w-56"
        aria-hidden
      >
        <Skeleton className="h-8 w-8 rounded-lg md:w-32" />
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-9 w-9 rounded-lg md:w-full" />
          ))}
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header skeleton */}
        <header
          className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card px-4 md:px-6"
          aria-hidden
        >
          <Skeleton className="h-8 w-8 rounded-md md:hidden" />
          <Skeleton className="h-9 flex-1 max-w-xs rounded-md" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </header>

        {/* Main content skeleton - grid of placeholder cards */}
        <main className="flex-1 overflow-auto p-4 md:p-6" aria-hidden>
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Page title row */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 rounded-md" />
              <Skeleton className="h-4 w-72 max-w-full rounded-md" />
            </div>

            {/* Card grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card p-6 shadow-card"
                >
                  <Skeleton className="mb-4 h-10 w-10 rounded-lg" />
                  <Skeleton className="mb-2 h-5 w-24 rounded-md" />
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="mt-2 h-4 w-3/4 rounded-md" />
                </div>
              ))}
            </div>

            {/* Secondary content block */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <Skeleton className="mb-4 h-6 w-40 rounded-md" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-4 w-full rounded-md" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
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
    return <ProtectedRouteLoadingSkeleton className={className} />
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
