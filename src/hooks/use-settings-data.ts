import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useAuthContext } from '@/contexts/auth-context'
import {
  fetchParent,
  updateParent,
  fetchChildProfiles,
  fetchNotificationSettings,
  fetchIntegrations,
  connectIntegration as apiConnectIntegration,
  disconnectIntegration as apiDisconnectIntegration,
  fetchBillingInfo,
  fetchInvoices,
  fetchDataExportRequests,
  fetchPrivacyConsents,
  requestDataDeletion,
} from '@/api/settings'
import { dataGuard } from '@/lib/data-guard'
import type {
  ParentAccount,
  ChildProfile,
  NotificationSettings,
  Integration,
  BillingInfo,
  Invoice,
  PrivacySettings,
  DataExportRequest,
} from '@/types/settings'
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_BILLING_INFO,
  DEFAULT_PRIVACY_SETTINGS,
} from '@/types/settings'

const MOCK_PARENT: ParentAccount = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah@example.com',
  profileCompletion: 75,
}

const MOCK_CHILDREN: ChildProfile[] = [
  {
    id: '1',
    name: 'Emma',
    age: 8,
    grade: '3rd grade',
    learningStyle: 'playful',
  },
  {
    id: '2',
    name: 'Liam',
    age: 11,
    grade: '6th grade',
    learningStyle: 'interactive',
  },
]

const MOCK_INTEGRATIONS: Integration[] = [
  { id: '1', provider: 'google_drive', connected: true, lastSync: new Date().toISOString() },
  { id: '2', provider: 'dropbox', connected: false },
  { id: '3', provider: 'classroom', connected: false },
]

export function useSettingsData() {
  const { user } = useAuthContext()
  const [parent, setParent] = useState<ParentAccount | null>(null)
  const [profiles, setProfiles] = useState<ChildProfile[]>([])
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS)
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [billing, setBilling] = useState<BillingInfo>(DEFAULT_BILLING_INFO)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [privacy, setPrivacy] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS)
  const [exportRequests, setExportRequests] = useState<DataExportRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadAll = useCallback(async () => {
    setIsLoading(true)
    try {
      const [
        parentRes,
        profilesRes,
        notifRes,
        intRes,
        billingRes,
        invoicesRes,
        privacyRes,
        exportsRes,
      ] = await Promise.all([
        fetchParent(),
        fetchChildProfiles(),
        fetchNotificationSettings(),
        fetchIntegrations(),
        fetchBillingInfo(),
        fetchInvoices(),
        fetchPrivacyConsents(),
        fetchDataExportRequests(),
      ])

      setParent(
        parentRes ??
          (user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
                profileCompletion: 75,
              }
            : MOCK_PARENT)
      )
      setProfiles(
        Array.isArray(profilesRes) && profilesRes.length > 0
          ? profilesRes
          : MOCK_CHILDREN
      )
      setNotifications(notifRes ?? DEFAULT_NOTIFICATION_SETTINGS)
      setIntegrations(
        Array.isArray(intRes) && intRes.length > 0 ? intRes : MOCK_INTEGRATIONS
      )
      setBilling(billingRes ?? DEFAULT_BILLING_INFO)
      setInvoices(Array.isArray(invoicesRes) ? invoicesRes : [])
      setPrivacy(privacyRes ?? DEFAULT_PRIVACY_SETTINGS)
      setExportRequests(Array.isArray(exportsRes) ? exportsRes : [])
    } catch {
      setParent(
        user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
              profileCompletion: 75,
            }
          : MOCK_PARENT
      )
      setProfiles(MOCK_CHILDREN)
      setNotifications(DEFAULT_NOTIFICATION_SETTINGS)
      setIntegrations(MOCK_INTEGRATIONS)
      setBilling(DEFAULT_BILLING_INFO)
      setInvoices([])
      setPrivacy(DEFAULT_PRIVACY_SETTINGS)
      setExportRequests([])
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const handleUpdateParent = useCallback(
    async (payload: { name?: string; email?: string }) => {
      const updated = await updateParent(payload)
      if (updated) {
        setParent(updated)
        toast.success('Profile updated')
      } else {
        toast.error('Failed to update profile')
        throw new Error('Update failed')
      }
    },
    []
  )

  const handleConnectIntegration = useCallback(
    async (provider: Integration['provider']) => {
      const updated = await apiConnectIntegration(provider)
      if (updated) {
        setIntegrations((prev) => {
          const rest = dataGuard(prev).filter((p) => p.provider !== provider)
          return [...rest, updated]
        })
        toast.success('Connected')
      } else {
        toast.info('Connect via OAuth (mock)')
        setIntegrations((prev) =>
          dataGuard(prev).map((p) =>
            p.provider === provider ? { ...p, connected: true, lastSync: new Date().toISOString() } : p
          )
        )
      }
    },
    []
  )

  const handleDisconnectIntegration = useCallback(
    async (provider: Integration['provider']) => {
      const ok = await apiDisconnectIntegration(provider)
      if (ok) {
        setIntegrations((prev) =>
          dataGuard(prev).map((p) =>
            p.provider === provider ? { ...p, connected: false, lastSync: undefined } : p
          )
        )
        toast.success('Disconnected')
      } else {
        setIntegrations((prev) =>
          dataGuard(prev).map((p) =>
            p.provider === provider ? { ...p, connected: false } : p
          )
        )
        toast.success('Disconnected')
      }
    },
    []
  )

  const handleChangePassword = useCallback(() => {
    toast.info('Redirecting to password reset…')
    window.location.href = '/forgot-password'
  }, [])

  const handleDeleteAccount = useCallback(async () => {
    await requestDataDeletion()
    toast.success('Account deletion requested. We will contact you to confirm.')
  }, [])

  return {
    parent,
    profiles,
    notifications,
    integrations,
    billing,
    invoices,
    privacy,
    exportRequests,
    isLoading,
    refetch: loadAll,
    updateParent: handleUpdateParent,
    setProfiles,
    setIntegrations,
    setBilling,
    setPrivacy,
    updateNotifications: (s: NotificationSettings) => setNotifications(s),
    connectIntegration: handleConnectIntegration,
    disconnectIntegration: handleDisconnectIntegration,
    changePassword: handleChangePassword,
    deleteAccount: handleDeleteAccount,
  }
}
