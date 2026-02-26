import { Bell, CheckCircle2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { InAppNotification } from '@/types/notifications'

export interface NotificationListItemProps {
  notification: InAppNotification
  onSelect: (n: InAppNotification) => void
  onMarkRead: (id: string) => void
  onClear: (id: string) => void
}

const typeLabels: Record<string, string> = {
  general: 'General',
  reminder: 'Reminder',
  achievement: 'Achievement',
  update: 'Update',
  study_completed: 'Study completed',
  subscription: 'Subscription',
}

export function NotificationListItem({
  notification,
  onSelect,
  onMarkRead,
  onClear,
}: NotificationListItemProps) {
  const isUnread = !notification.readAt
  const typeLabel = typeLabels[notification.type] ?? notification.type

  const handleClick = () => {
    onSelect(notification)
    if (isUnread) {
      onMarkRead(notification.id)
    }
  }

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    onMarkRead(notification.id)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClear(notification.id)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      className={cn(
        'group flex items-start gap-4 rounded-2xl border-2 border-border/60 bg-card p-4 transition-all duration-200',
        'hover:border-primary/30 hover:shadow-card-hover hover:scale-[1.01]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isUnread && 'border-primary/20 bg-primary/5'
      )}
      aria-label={`${notification.title}${isUnread ? ', unread' : ''}`}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          isUnread
            ? 'bg-primary/20 text-primary'
            : 'bg-muted text-muted-foreground'
        )}
      >
        <Bell className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium',
              isUnread ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {notification.title}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {typeLabel}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {notification.message}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {isUnread && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={handleMarkRead}
            aria-label="Mark as read"
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive"
          onClick={handleClear}
          aria-label="Remove notification"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
