import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotificationEmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 px-8 py-16 text-center animate-fade-in"
      role="status"
      aria-label="No notifications"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(var(--peach))] to-[rgb(var(--tangerine))] text-white shadow-card">
        <Bell className="h-10 w-10" aria-hidden />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-foreground">
        No notifications yet
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        When you get study reminders, achievements, or updates, they&apos;ll show up here.
      </p>
      <Button asChild variant="accent" className="mt-6">
        <Link to="/dashboard/create">Create a study</Link>
      </Button>
    </div>
  )
}
