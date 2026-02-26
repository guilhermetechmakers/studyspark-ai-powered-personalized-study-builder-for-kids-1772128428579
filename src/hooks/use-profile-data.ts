/**
 * useProfileData - Fetches user profile and child profiles from Supabase.
 * Uses profile API; supports audit log and export.
 */

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  fetchUserProfile,
  fetchChildProfiles,
  updateUserProfile,
  createChildProfile,
  updateChildProfile,
  deleteChildProfile,
  fetchProfileAuditLog,
} from '@/api/profile'
import { downloadJsonExport, downloadCsvExport } from '@/api/export'
import { supabase } from '@/lib/supabase'
import type { UserProfile, ChildProfile, ChildProfileInput, ProfileAuditLog } from '@/types/profile'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''

export function useProfileData() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [children, setChildren] = useState<ChildProfile[]>([])
  const [auditLog, setAuditLog] = useState<ProfileAuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadAll = useCallback(async () => {
    setIsLoading(true)
    try {
      const [profile, profiles] = await Promise.all([
        fetchUserProfile(),
        fetchChildProfiles(),
      ])
      setUserProfile(profile)
      setChildren(Array.isArray(profiles) ? profiles : [])
    } catch {
      setUserProfile(null)
      setChildren([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadAudit = useCallback(async (options?: { targetId?: string; targetType?: 'user' | 'child' }) => {
    const logs = await fetchProfileAuditLog(options)
    setAuditLog(Array.isArray(logs) ? logs : [])
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const updateProfile = useCallback(
    async (payload: { name?: string; email?: string; phone?: string; address?: string }) => {
      const updated = await updateUserProfile(payload)
      if (updated) {
        setUserProfile(updated)
        toast.success('Profile updated')
        return updated
      }
      toast.error('Failed to update profile')
      return null
    },
    []
  )

  const addChild = useCallback(async (payload: ChildProfileInput) => {
    const created = await createChildProfile(payload)
    if (created) {
      setChildren((prev) => [...(prev ?? []), created])
      toast.success('Child profile added')
      return created
    }
    toast.error('Failed to add child profile')
    return null
  }, [])

  const updateChild = useCallback(
    async (id: string, payload: Partial<ChildProfileInput>) => {
      const updated = await updateChildProfile(id, payload)
      if (updated) {
        setChildren((prev) =>
          (prev ?? []).map((c) => (c.id === id ? updated : c))
        )
        toast.success('Child profile updated')
        return updated
      }
      toast.error('Failed to update child profile')
      return null
    },
    []
  )

  const removeChild = useCallback(async (id: string) => {
    const ok = await deleteChildProfile(id)
    if (ok) {
      setChildren((prev) => (prev ?? []).filter((c) => c.id !== id))
      toast.success('Child profile deleted')
      return true
    }
    toast.error('Failed to delete child profile')
    return false
  }, [])

  const exportJson = useCallback(async () => {
    try {
      await downloadJsonExport()
      toast.success('JSON export downloaded')
    } catch {
      toast.error('Failed to export data')
    }
  }, [])

  const exportCsv = useCallback(async () => {
    try {
      await downloadCsvExport()
      toast.success('CSV export downloaded')
    } catch {
      toast.error('Failed to export data')
    }
  }, [])

  const requestPrivacyDeletion = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token || !supabaseUrl) {
        toast.error('Authentication required')
        return false
      }
      const res = await fetch(`${supabaseUrl}/functions/v1/privacy-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.success) {
        toast.success('Account deletion requested. You will be signed out.')
        await supabase.auth.signOut()
        window.location.href = '/'
        return true
      }
      toast.error(data?.message ?? 'Failed to request deletion')
      return false
    } catch {
      toast.error('Failed to request deletion')
      return false
    }
  }, [])

  return {
    userProfile,
    children,
    auditLog,
    isLoading,
    refetch: loadAll,
    loadAudit,
    updateProfile,
    addChild,
    updateChild,
    removeChild,
    exportJson,
    exportCsv,
    requestPrivacyDeletion,
  }
}
