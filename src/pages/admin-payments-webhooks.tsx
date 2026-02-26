import { useCallback, useEffect, useState } from 'react'
import { Webhook, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'
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

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await apiGet<WebhookEventsResponse>('/payments-webhook-events')
      const list =
        Array.isArray(res?.data) ? res.data : Array.isArray(res?.events) ? res.events : []
      setEvents(list)
    } catch {
      toast.error('Failed to load webhook events')
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
    <div className="flex flex-1 flex-col gap-6 p-6">
      <header className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Webhook Events
        </h1>
        <p className="mt-1 text-muted-foreground">
          Stripe webhook processing status and idempotency
        </p>
      </header>

      <Card className="overflow-hidden border-2 border-border/60 transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Webhook className="h-6 w-6 text-primary" />
            Event log
          </CardTitle>
          <CardDescription>
            All received Stripe webhook events. Duplicate events are not re-processed.
          </CardDescription>
          <Button
            variant="outline"
            size="sm"
            className="w-fit rounded-full gap-2"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : safeEvents.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
              <Webhook className="mx-auto h-16 w-16 text-muted-foreground" />
              <p className="mt-4 font-medium text-foreground">
                No webhook events yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Events will appear here when Stripe sends webhooks to your endpoint
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Configure STRIPE_WEBHOOK_SECRET and point Stripe to /functions/v1/payments-webhook
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Event ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                      Received
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
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
                      <td className="px-4 py-3 text-sm">{ev.type}</td>
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
                        >
                          {ev.status === 'processed' ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : ev.status === 'failed' ? (
                            <XCircle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
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
