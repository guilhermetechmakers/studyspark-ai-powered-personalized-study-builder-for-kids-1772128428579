import { useCallback, useEffect, useState } from 'react'
import { Webhook, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { apiGet } from '@/lib/api'
import type { WebhookEvent } from '@/types/payments'

interface WebhookEventsResponse {
  data?: WebhookEvent[]
  events?: WebhookEvent[]
  count?: number
}

export function AdminPaymentsWebhooksPage() {
  const [events, setEvents] = useState<WebhookEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiGet<WebhookEventsResponse>('/payments-webhook-events')
      const list =
        Array.isArray(res?.data) ? res.data : Array.isArray(res?.events) ? res.events : []
      setEvents(list)
    } catch {
      const msg = 'Failed to load webhook events'
      toast.error(msg)
      setError(msg)
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const safeEvents = Array.isArray(events) ? events : []

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
      <header className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Webhook Events
        </h1>
        <p className="mt-1 text-muted-foreground">
          Stripe webhook processing status and idempotency
        </p>
      </header>

      <Card className="overflow-hidden border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Webhook className="h-6 w-6 text-primary" aria-hidden />
              Event log
            </CardTitle>
            <CardDescription>
              All received Stripe webhook events. Duplicate events are not re-processed.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-fit shrink-0 rounded-full gap-2"
            onClick={loadData}
            disabled={isLoading}
            aria-label={isLoading ? 'Refreshing webhook events' : 'Refresh webhook events'}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} aria-hidden />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2" role="status" aria-label="Loading webhook events">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <div
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-8 sm:p-12 text-center"
              role="alert"
              aria-label="Error loading webhook events"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertCircle className="h-8 w-8" aria-hidden />
              </div>
              <p className="mt-4 font-medium text-foreground">
                Could not load webhook events
              </p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {error} Check your connection and try again.
              </p>
              <Button
                variant="default"
                size="sm"
                className="mt-6 rounded-full gap-2"
                onClick={loadData}
                aria-label="Retry loading webhook events"
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                Retry
              </Button>
            </div>
          ) : safeEvents.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-8 sm:p-12 text-center"
              role="status"
              aria-label="No webhook events"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(var(--peach))] to-[rgb(var(--tangerine))] text-primary-foreground shadow-card">
                <Webhook className="h-8 w-8" aria-hidden />
              </div>
              <p className="mt-4 font-medium text-foreground">
                No webhook events yet
              </p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Events will appear here when Stripe sends webhooks to your endpoint
              </p>
              <p className="mt-2 max-w-md text-xs text-muted-foreground">
                Configure STRIPE_WEBHOOK_SECRET and point Stripe to /functions/v1/payments-webhook
              </p>
              <Button
                variant="default"
                size="sm"
                className="mt-6 rounded-full gap-2"
                onClick={loadData}
                aria-label="Refresh to check for new webhook events"
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                Refresh events
              </Button>
            </div>
          ) : (
            <div
              className="overflow-x-auto rounded-2xl border border-border bg-card shadow-card"
              role="region"
              aria-label="Webhook events table"
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Event ID
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Type
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Received
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Retries
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {safeEvents.map((ev) => (
                    <tr
                      key={ev.id}
                      className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {ev.event_id?.slice(0, 20)}…
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{ev.type}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            ev.status === 'processed'
                              ? 'default'
                              : ev.status === 'failed'
                                ? 'destructive'
                                : 'secondary'
                          }
                          className="rounded-full gap-1"
                          aria-label={`Status: ${ev.status}`}
                        >
                          {ev.status === 'processed' ? (
                            <CheckCircle className="h-3 w-3" aria-hidden />
                          ) : ev.status === 'failed' ? (
                            <XCircle className="h-3 w-3" aria-hidden />
                          ) : (
                            <Clock className="h-3 w-3" aria-hidden />
                          )}
                          {ev.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {ev.received_at
                          ? new Date(ev.received_at).toLocaleString()
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {ev.retry_count ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
