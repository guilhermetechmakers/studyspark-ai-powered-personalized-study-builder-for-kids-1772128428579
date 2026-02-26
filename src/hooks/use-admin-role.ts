/**
 * useAdminRole - Checks if the current user has admin or moderator role.
 * Uses profiles.role or user_metadata.role for RBAC.
 */

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthContextOptional } from '@/contexts/auth-context'

export type AdminRole = 'admin' | 'moderator' | null

export interface UseAdminRoleResult {
  isAdmin: boolean
  isModerator: boolean
  role: AdminRole
  isLoading: boolean
  hasPermission: (permission: string) => boolean
}

const ADMIN_PERMISSIONS: Record<string, string[]> = {
  admin: [
    'users:read',
    'users:write',
    'moderation:read',
    'moderation:write',
    'content:read',
    'content:write',
    'analytics:read',
    'health:read',
    'audit:read',
    'settings:read',
    'settings:write',
  ],
  moderator: ['moderation:read', 'moderation:write', 'content:read', 'content:write'],
}

export function useAdminRole(): UseAdminRoleResult {
  const auth = useAuthContextOptional()
  const [role, setRole] = useState<AdminRole>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkRole = useCallback(async () => {
    if (!auth?.user?.id) {
      setRole(null)
      setIsLoading(false)
      return
    }

    try {
      // Check profiles.role (migration adds role column)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', auth.user.id)
        .maybeSingle()

      const profileRole = (profile as { role?: string } | null)?.role
      if (profileRole === 'admin' || profileRole === 'moderator') {
        setRole(profileRole)
      } else {
        setRole(null)
      }
    } catch {
      setRole(null)
    } finally {
      setIsLoading(false)
    }
  }, [auth?.user?.id])

  useEffect(() => {
    checkRole()
  }, [checkRole])

  const permissions = role ? (ADMIN_PERMISSIONS[role] ?? []) : []
  const hasPermission = useCallback(
    (permission: string) => permissions.includes(permission),
    [permissions]
  )

  return {
    isAdmin: role === 'admin',
    isModerator: role === 'moderator' || role === 'admin',
    role,
    isLoading: auth?.isLoading ?? isLoading,
    hasPermission,
  }
}
