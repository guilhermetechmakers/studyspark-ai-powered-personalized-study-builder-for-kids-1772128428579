/**
 * AuthContext - Centralized authentication state for StudySpark.
 * Uses Supabase Auth; provides user, loading state, and logout.
 * All consumers get null-safe access to user data.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase'
import { signOut as apiSignOut } from '@/api/auth'
import type { User } from '@/types/auth'

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toUser(
  raw: { id: string; email?: string; user_metadata?: { name?: string }; created_at?: string } | null
): User | null {
  if (!raw) return null
  const now = new Date().toISOString()
  return {
    id: raw.id ?? '',
    name: raw.user_metadata?.name ?? raw.email ?? 'User',
    email: raw.email ?? '',
    createdAt: raw.created_at ?? now,
    updatedAt: now,
    authenticatedAt: now,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState)

  const refreshUser = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        setState({ user: null, isLoading: false, isAuthenticated: false })
        return
      }
      setState({
        user: toUser(user),
        isLoading: false,
        isAuthenticated: Boolean(user),
      })
    } catch {
      setState({ user: null, isLoading: false, isAuthenticated: false })
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await apiSignOut()
      setState({ user: null, isLoading: false, isAuthenticated: false })
    } catch {
      setState({ user: null, isLoading: false, isAuthenticated: false })
    }
  }, [])

  useEffect(() => {
    refreshUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      setState({
        user: toUser(user),
        isLoading: false,
        isAuthenticated: Boolean(user),
      })
    })

    return () => subscription.unsubscribe()
  }, [refreshUser])

  const value: AuthContextValue = {
    ...state,
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return ctx
}

export function useAuthContextOptional(): AuthContextValue | null {
  return useContext(AuthContext)
}
