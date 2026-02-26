/**
 * NotFoundPageContainer - 404 Not Found page with recovery paths.
 * Renders headline, illustration, Home/Dashboard (conditional), Help, and Search.
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { NotFoundIllustration } from './not-found-illustration'
import { NotFoundSearchBar } from './not-found-search-bar'
import { HelpLink } from './help-link'
import { HomeDashboardNavigator } from './home-dashboard-navigator'
import { useAuth } from '@/hooks/use-auth'

export interface NotFoundPageContainerProps {
  isAuthenticated?: boolean
}

export function NotFoundPageContainer({
  isAuthenticated: propAuth,
}: NotFoundPageContainerProps) {
  const { isAuthenticated: hookAuth } = useAuth()
  const authenticated = propAuth ?? hookAuth ?? false

  const [searchQuery, setSearchQuery] = useState<string>('')

  const navigate = useNavigate()

  const handleSearchSubmit = useCallback(
    (query: string) => {
      const trimmed = (query ?? '').trim()
      if (trimmed.length > 0) {
        navigate(`/search?q=${encodeURIComponent(trimmed)}`)
      }
    },
    [navigate]
  )

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value ?? '')
  }, [])

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[rgb(var(--peach-light))]/30 via-background to-[rgb(var(--lavender))]/15 px-4 py-12 sm:py-16"
      role="main"
      aria-labelledby="not-found-heading"
    >
      <div className="container flex max-w-2xl flex-col items-center text-center animate-stagger">
        {/* Headline */}
        <h1
          id="not-found-heading"
          className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
        >
          Oops, we can&apos;t find that page
        </h1>

        {/* Subheading */}
        <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
          The page you&apos;re looking for might have moved or never existed.
        </p>

        {/* Illustration */}
        <div className="mt-8 sm:mt-10">
          <NotFoundIllustration />
        </div>

        {/* Primary actions: Home + Dashboard (if authenticated) */}
        <div className="mt-8 sm:mt-10">
          <HomeDashboardNavigator isAuthenticated={authenticated} />
        </div>

        {/* Search bar */}
        <div className="mt-8 w-full">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Or search for what you need
          </p>
          <NotFoundSearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
            className="justify-center"
          />
        </div>

        {/* Help link */}
        <div className="mt-8">
          <HelpLink />
        </div>
      </div>
    </main>
  )
}
