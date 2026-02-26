/**
 * useAuth - Returns current authentication state.
 * Uses AuthContext when available; provides isAuthenticated and isLoading.
 * Used for conditional rendering (e.g., Dashboard button on 404 page).
 */

import { useAuthContextOptional } from '@/contexts/auth-context'

export function useAuth(): { isAuthenticated: boolean; isLoading: boolean } {
  const ctx = useAuthContextOptional()
  if (!ctx) {
    return { isAuthenticated: false, isLoading: false }
  }
  return {
    isAuthenticated: ctx.isAuthenticated,
    isLoading: ctx.isLoading,
  }
}
