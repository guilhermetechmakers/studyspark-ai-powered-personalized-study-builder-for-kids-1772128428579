/**
 * AuthCallbackPage - Handles OAuth provider redirects.
 * Supabase redirects here after OAuth; session is established from URL hash.
 * Redirects to dashboard or return URL.
 */

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          setError(sessionError.message)
          return
        }
        if (session) {
          const returnTo = searchParams.get('returnTo') ?? '/dashboard'
          navigate(returnTo.startsWith('/') ? returnTo : '/dashboard', { replace: true })
          return
        }
        setError('Authentication failed. Please try again.')
      } catch {
        setError('Something went wrong. Please try again.')
      }
    }
    run()
  }, [navigate, searchParams])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[rgb(var(--peach-light))]/20 via-background to-[rgb(var(--lavender))]/10 p-4">
        <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-card text-center">
          <p className="text-destructive" role="alert">
            {error}
          </p>
          <a
            href="/login"
            className="mt-4 inline-block text-primary font-medium hover:underline"
          >
            ← Back to login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[rgb(var(--peach-light))]/20 via-background to-[rgb(var(--lavender))]/10 p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(var(--lavender))] to-[rgb(var(--violet))] text-white">
          <Sparkles className="h-6 w-6" aria-hidden />
        </div>
        <p className="text-muted-foreground">Signing you in…</p>
        <div className="h-2 w-24 animate-pulse rounded-full bg-primary/20" aria-hidden />
      </div>
    </div>
  )
}
