/**
 * Notification Preferences Page - Granular controls for email, push, unsubscribe
 */

import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Bell, MessageSquare, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '@/api/notifications'
import type { NotificationPreferences } from '@/types/notifications'

export function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [unsubscribeConfirm, setUnsubscribeConfirm] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getNotificationPreferences()
      setPrefs(data)
    } catch {
      setPrefs({
        emailMarketing: false,
        emailTransactional: true,
        pushEnabled: true,
        pushPlatforms: ['fcm', 'apns'],
        unsubscribeStatus: 'active',
      })
      toast.error('Failed to load preferences')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleUpdate = useCallback(
    async (updates: Partial<{
      email_marketing: boolean
      email_transactional: boolean
      push_enabled: boolean
      unsubscribe_status: string
    }>) => {
      if (!prefs) return
      setSaving(true)
      try {
        const updated = await updateNotificationPreferences(updates)
        setPrefs(updated)
        toast.success('Preferences updated')
      } catch {
        toast.error('Failed to update')
      } finally {
        setSaving(false)
      }
    },
    [prefs]
  )

  const handleUnsubscribeAll = useCallback(async () => {
    if (!unsubscribeConfirm) {
      setUnsubscribeConfirm(true)
      return
    }
    setSaving(true)
    try {
      await updateNotificationPreferences({
        email_marketing: false,
        email_transactional: false,
        push_enabled: false,
        unsubscribe_status: 'unsubscribed',
      })
      setPrefs((p) =>
        p
          ? {
              ...p,
              emailMarketing: false,
              emailTransactional: false,
              pushEnabled: false,
              unsubscribeStatus: 'unsubscribed',
            }
          : null
      )
      setUnsubscribeConfirm(false)
      toast.success('Unsubscribed from all notifications')
    } catch {
      toast.error('Failed to unsubscribe')
    } finally {
      setSaving(false)
    }
  }, [unsubscribeConfirm])

  if (isLoading || !prefs) {
    return (
      <main className="container mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </main>
    )
  }

  return (
    <main
      className="container mx-auto max-w-2xl space-y-6 p-4 sm:p-6 animate-fade-in"
      aria-labelledby="preferences-heading"
    >
      <div>
        <h1
          id="preferences-heading"
          className="text-2xl font-bold text-foreground md:text-3xl"
        >
          Notification preferences
        </h1>
        <p className="mt-1 text-muted-foreground">
          Choose how you want to receive study reminders, achievements, and updates
        </p>
      </div>

      <Card className="rounded-2xl border-2 border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email notifications
          </CardTitle>
          <CardDescription>
            Transactional emails (e.g. password reset) are always sent. Marketing emails are optional.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-transactional" className="font-medium">
              Transactional emails
            </Label>
            <Switch
              id="email-transactional"
              checked={prefs.emailTransactional}
              onCheckedChange={(checked) =>
                handleUpdate({ email_transactional: Boolean(checked) })
              }
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-marketing" className="font-medium">
              Marketing emails
            </Label>
            <Switch
              id="email-marketing"
              checked={prefs.emailMarketing}
              onCheckedChange={(checked) =>
                handleUpdate({ email_marketing: Boolean(checked) })
              }
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-2 border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push notifications
          </CardTitle>
          <CardDescription>
            Receive notifications on your mobile device when the app is in the background.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-enabled" className="font-medium">
              Enable push notifications
            </Label>
            <Switch
              id="push-enabled"
              checked={prefs.pushEnabled}
              onCheckedChange={(checked) =>
                handleUpdate({ push_enabled: Boolean(checked) })
              }
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-2 border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            In-app notifications
          </CardTitle>
          <CardDescription>
            Notifications shown in the app are always enabled. Manage them in the Notification Center.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link to="/dashboard/notifications">Open Notification Center</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-2 border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Unsubscribe from all
          </CardTitle>
          <CardDescription>
            Stop all email and push notifications. In-app notifications will still appear.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unsubscribeConfirm ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Are you sure? You will not receive any email or push notifications.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleUnsubscribeAll}
                  disabled={saving}
                >
                  Yes, unsubscribe from all
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setUnsubscribeConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={() => setUnsubscribeConfirm(true)}
            >
              Unsubscribe from all
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
