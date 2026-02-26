/**
 * HomeDashboardNavigator - Primary actions for 404 page.
 * Home always visible; Dashboard only when authenticated.
 */

import { Home, LayoutDashboard } from 'lucide-react'
import { ActionButton } from './action-button'

export interface HomeDashboardNavigatorProps {
  isAuthenticated: boolean
  className?: string
}

export function HomeDashboardNavigator({
  isAuthenticated,
  className,
}: HomeDashboardNavigatorProps) {
  const authenticated = isAuthenticated ?? false

  return (
    <nav
      className={className}
      aria-label="Navigation options"
    >
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
        <ActionButton
          to="/"
          label="Home"
          variant="primary"
          icon={Home}
          aria-label="Go to Home"
        />
        {authenticated && (
          <ActionButton
            to="/dashboard"
            label="Dashboard"
            variant="secondary"
            icon={LayoutDashboard}
            aria-label="Go to Dashboard"
          />
        )}
      </div>
    </nav>
  )
}
