/**
 * Notification Center Page (page_p011) - In-app notifications, preferences link
 */

import { NotificationCenterView } from '@/components/notifications'

export function NotificationCenterPage() {
  return (
    <main
      className="container mx-auto max-w-4xl animate-fade-in"
      aria-labelledby="notifications-heading"
    >
      <NotificationCenterView />
    </main>
  )
}
