/**
 * SearchRedirectPage - Handles /search?q=... and redirects to the appropriate
 * destination. Authenticated users go to dashboard studies; others to help.
 */

import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'

export function SearchRedirectPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()

  const query = searchParams.get('q') ?? ''
  const trimmed = query.trim()

  useEffect(() => {
    if (isLoading) return

    if (trimmed.length > 0) {
      const encoded = encodeURIComponent(trimmed)
      if (isAuthenticated) {
        navigate(`/dashboard/studies?q=${encoded}`, { replace: true })
      } else {
        navigate(`/about-help?q=${encoded}`, { replace: true })
      }
    } else {
      navigate('/about-help', { replace: true })
    }
  }, [isLoading, isAuthenticated, trimmed, navigate])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <p className="text-sm text-muted-foreground">Finding your content...</p>
      </div>
    </main>
  )
}
