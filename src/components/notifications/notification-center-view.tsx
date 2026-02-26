import { useState, useCallback, useEffect } from 'react'
import { Search, RefreshCw, CheckCheck, Trash2, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  listInAppNotifications,
  markInAppAsRead,
  clearInAppNotifications,
} from '@/api/notifications'
import type { InAppNotification } from '@/types/notifications'
import { NotificationListItem } from './notification-list-item'
import { NotificationDetailSheet } from './notification-detail-sheet'
import { NotificationEmptyState } from './notification-empty-state'

const TYPES = [
  { value: '', label: 'All' },
  { value: 'reminder', label: 'Reminders' },
  { value: 'achievement', label: 'Achievements' },
  { value: 'update', label: 'Updates' },
  { value: 'study_completed', label: 'Study completed' },
  { value: 'general', label: 'General' },
] as const

export function NotificationCenterView() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [selected, setSelected] = useState<InAppNotification | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const loadNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await listInAppNotifications({
        limit: 50,
        offset: 0,
        type: typeFilter || undefined,
        unreadOnly: unreadOnly || undefined,
      })
      setNotifications(Array.isArray(data) ? data : [])
    } catch {
      setNotifications([])
      toast.error('Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }, [typeFilter, unreadOnly])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  const handleSelect = useCallback((n: InAppNotification) => {
    setSelected(n)
    setDetailOpen(true)
  }, [])

  const handleMarkRead = useCallback(async (id: string) => {
    try {
      await markInAppAsRead({ ids: [id] })
      setNotifications((prev) =>
        (prev ?? []).map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n
        )
      )
      if (selected?.id === id) {
        setSelected((s) => (s ? { ...s, readAt: new Date().toISOString() } : null))
      }
    } catch {
      toast.error('Failed to mark as read')
    }
  }, [selected])

  const handleClear = useCallback(async (id: string) => {
    try {
      await clearInAppNotifications({ ids: [id] })
      setNotifications((prev) => (prev ?? []).filter((n) => n.id !== id))
      if (selected?.id === id) {
        setSelected(null)
        setDetailOpen(false)
      }
      toast.success('Notification removed')
    } catch {
      toast.error('Failed to remove')
    }
  }, [selected])

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markInAppAsRead({ markAll: true })
      const now = new Date().toISOString()
      setNotifications((prev) =>
        (prev ?? []).map((n) => ({ ...n, readAt: n.readAt ?? now }))
      )
      if (selected) {
        setSelected((s) => (s ? { ...s, readAt: s.readAt ?? now } : null))
      }
      toast.success('All marked as read')
    } catch {
      toast.error('Failed to mark all as read')
    }
  }, [selected])

  const handleClearAll = useCallback(async () => {
    if (!confirm('Clear all notifications? This cannot be undone.')) return
    try {
      await clearInAppNotifications({ clearAll: true })
      setNotifications([])
      setSelected(null)
      setDetailOpen(false)
      toast.success('All notifications cleared')
    } catch {
      toast.error('Failed to clear')
    }
  }, [])

  const filtered = (notifications ?? []).filter((n) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (n.title ?? '').toLowerCase().includes(q) ||
      (n.message ?? '').toLowerCase().includes(q)
    )
  })

  const unreadCount = (notifications ?? []).filter((n) => !n.readAt).length

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Notifications
            </h1>
            <p className="mt-1 text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : 'All caught up!'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard/notifications/preferences" className="gap-2">
                <Settings className="h-4 w-4" />
                Preferences
              </Link>
            </Button>
            {(notifications ?? []).length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                  className="gap-2"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear all
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search notifications"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 rounded-full border-2 border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Filter by type"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <label className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-input bg-background px-4 text-sm">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                className="rounded"
              />
              Unread only
            </label>
            <Button
              variant="outline"
              size="icon"
              onClick={loadNotifications}
              aria-label="Refresh notifications"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 pb-6 sm:px-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <NotificationEmptyState />
        ) : (
          <div className="space-y-3 animate-fade-in">
            {filtered.map((n, idx) => (
              <div
                key={n.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <NotificationListItem
                  notification={n}
                  onSelect={handleSelect}
                  onMarkRead={handleMarkRead}
                  onClear={handleClear}
                />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <NotificationDetailSheet
        notification={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
