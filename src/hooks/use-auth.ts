/**
 * useAuth - Returns current authentication state from Supabase.
 * Used for conditional rendering (e.g., Dashboard button on 404 page).
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useAuth(): { isAuthenticated: boolean; isLoading: boolean } {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setIsAuthenticated(Boolean(session))
      } catch {
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session))
    })

    return () => subscription.unsubscribe()
  }, [])

  return { isAuthenticated, isLoading }
}
