import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Bell, MessageSquare, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { NotificationSettings } from '@/types/settings'
import { updateNotificationSettings } from '@/api/settings'

const CHANNELS = [
  { key: 'email' as const, label: 'Email', icon: Mail },
  { key: 'push' as const, label: 'Push', icon: Bell },
  { key: 'inApp' as const, label: 'In-app', icon: MessageSquare },
] as const

const CATEGORIES = [
  { key: 'studyCompleted' as const, label: 'Study completion' },
  { key: 'reminders' as const, label: 'Reminders' },
  { key: 'subscriptionUpdates' as const, label: 'Subscription updates' },
  { key: 'weeklyDigest' as const, label: 'Weekly digest' },
] as const

export interface NotificationsPanelProps {
  settings: NotificationSettings
  onSettingsChange: (settings: NotificationSettings) => void
}

export function NotificationsPanel({
  settings,
  onSettingsChange,
}: NotificationsPanelProps) {
  const [saving, setSaving] = useState(false)

  const handleChannelToggle = async (channel: keyof NotificationSettings, enabled: boolean) => {
    if (channel === 'id' || channel === 'parentId') return
    const ch = settings[channel]
    if (!ch || typeof ch !== 'object') return
    const next: NotificationSettings = {
      ...settings,
      [channel]: { ...ch, enabled },
    }
    setSaving(true)
    try {
      const updated = await updateNotificationSettings(next)
      if (updated) {
        onSettingsChange(updated)
        toast.success('Notification preferences updated')
      } else {
        toast.error('Failed to update')
      }
    } catch {
      toast.error('Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const handleCategoryToggle = async (
    channel: keyof NotificationSettings,
    category: string,
    enabled: boolean
  ) => {
    if (channel === 'id' || channel === 'parentId') return
    const ch = settings[channel]
    if (!ch || typeof ch !== 'object' || !ch.categories) return
    const nextCategories = { ...ch.categories, [category]: enabled }
    const next: NotificationSettings = {
      ...settings,
      [channel]: { ...ch, categories: nextCategories },
    }
    setSaving(true)
    try {
      const updated = await updateNotificationSettings(next)
      if (updated) {
        onSettingsChange(updated)
        toast.success('Notification preferences updated')
      } else {
        toast.error('Failed to update')
      }
    } catch {
      toast.error('Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const enabledCount = CHANNELS.filter((c) => settings[c.key]?.enabled).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Choose how you want to be notified about study progress and updates
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild className="rounded-full gap-1.5">
            <Link to="/dashboard/notifications/preferences">
              <ExternalLink className="h-4 w-4" />
              Full preferences
            </Link>
          </Button>
          <Badge variant={enabledCount > 0 ? 'default' : 'secondary'}>
            {enabledCount} channel{enabledCount !== 1 ? 's' : ''} on
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {CHANNELS.map(({ key, label, icon: Icon }) => {
          const ch = settings[key]
          if (!ch || typeof ch !== 'object') return null
          const isEnabled = Boolean(ch.enabled)
          return (
            <div key={key}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor={`notif-${key}`} className="font-medium">
                    {label} notifications
                  </Label>
                </div>
                <Switch
                  id={`notif-${key}`}
                  checked={isEnabled}
                  onCheckedChange={(checked) => handleChannelToggle(key, checked)}
                  disabled={saving}
                />
              </div>
              {isEnabled && (
                <div className="mt-3 space-y-2 pl-6">
                  {CATEGORIES.map((cat) => {
                    const catEnabled = Boolean(ch.categories?.[cat.key])
                    return (
                      <div
                        key={cat.key}
                        className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                      >
                        <span className="text-sm text-muted-foreground">{cat.label}</span>
                        <Switch
                          checked={catEnabled}
                          onCheckedChange={(checked) =>
                            handleCategoryToggle(key, cat.key, checked)
                          }
                          disabled={saving}
                        />
                      </div>
                    )
                  })}
                </div>
              )}
              <Separator className="mt-4" />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
