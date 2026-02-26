import { Bell } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import type { InAppNotification } from '@/types/notifications'

export interface NotificationDetailSheetProps {
  notification: InAppNotification | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const typeLabels: Record<string, string> = {
  general: 'General',
  reminder: 'Reminder',
  achievement: 'Achievement',
  update: 'Update',
  study_completed: 'Study completed',
  subscription: 'Subscription',
}

export function NotificationDetailSheet({
  notification,
  open,
  onOpenChange,
}: NotificationDetailSheetProps) {
  if (!notification) return null

  const typeLabel = typeLabels[notification.type] ?? notification.type

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col sm:max-w-md"
        aria-describedby={undefined}
      >
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(var(--lavender))] to-[rgb(var(--violet))] text-white">
              <Bell className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <SheetTitle className="text-left">{notification.title}</SheetTitle>
              <SheetDescription className="text-left">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {typeLabel}
                </span>
                <span className="ml-2 text-xs">
                  {formatDateTime(notification.createdAt)}
                </span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <div className="mt-6 flex-1 overflow-auto">
          <p className="text-sm leading-relaxed text-foreground">
            {notification.message}
          </p>
          {notification.data &&
            typeof notification.data === 'object' &&
            Object.keys(notification.data).length > 0 && (
              <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Details
                </p>
                <pre className="overflow-auto text-xs text-foreground">
                  {JSON.stringify(notification.data, null, 2)}
                </pre>
              </div>
            )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
