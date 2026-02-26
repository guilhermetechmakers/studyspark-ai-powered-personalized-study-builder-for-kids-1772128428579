/**
 * Admin Webhooks - Webhook events status and idempotency dashboard
 */

import { useCallback, useEffect, useState } from 'react'
import { WebhookEventsPanel } from '@/components/payments'
import { fetchWebhookEvents } from '@/api/payments'
import type { WebhookEvent } from '@/types/payments'

export function AdminWebhooksPage() {
  const [events, setEvents] = useState<WebhookEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const loadEvents = useCallback(async () => {
    setIsLoading(true)
    try {
      const list = await fetchWebhookEvents({
        limit: 50,
        offset: 0,
        status: statusFilter || undefined,
      })
      setEvents(list ?? [])
    } catch {
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const handleRetry = useCallback((_event: WebhookEvent) => {
    // Retry would call an Edge Function to reprocess - placeholder
    loadEvents()
  }, [loadEvents])

  return (
    <div className="flex flex-1 flex-col p-6">
      <header className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Webhook Events
        </h1>
        <p className="mt-1 text-muted-foreground">
          Monitor Stripe webhook processing and idempotency status.
        </p>
        <div className="mt-4 flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-full border border-input bg-background px-4 py-2 text-sm"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="processed">Processed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <button
            type="button"
            onClick={loadEvents}
            className="rounded-full border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Refresh
          </button>
        </div>
      </header>

      <WebhookEventsPanel
        events={events}
        isLoading={isLoading}
        onRetry={handleRetry}
      />
    </div>
  )
}
