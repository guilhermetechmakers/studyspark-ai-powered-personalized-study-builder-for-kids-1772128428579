/**
 * WebhookEventsPanel - Admin view for webhook processing integrity
 * StudySpark design: pastel cards, status badges
 */

import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { WebhookEvent } from '@/types/payments'

export interface WebhookEventsPanelProps {
  events: WebhookEvent[]
  isLoading?: boolean
  onRetry?: (event: WebhookEvent) => void
  className?: string
}

const statusConfig: Record<string, { icon: typeof CheckCircle; class: string }> = {
  processed: { icon: CheckCircle, class: 'bg-success/20 text-success-foreground' },
  pending: { icon: Clock, class: 'bg-warning/20 text-warning-foreground' },
  failed: { icon: XCircle, class: 'bg-destructive/20 text-destructive-foreground' },
}

export function WebhookEventsPanel({
  events = [],
  isLoading = false,
  onRetry,
  className,
}: WebhookEventsPanelProps) {
  const safeEvents = Array.isArray(events) ? events : []

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader>
          <div className="h-6 w-40 rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-muted" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" aria-hidden />
          Webhook Events
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Idempotency status and processing history
        </p>
      </CardHeader>
      <CardContent>
        {safeEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium text-foreground">No webhook events yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Events will appear here when Stripe sends webhooks.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {safeEvents.map((ev) => {
              const status = ev.status ?? 'pending'
              const config = statusConfig[status] ?? {
                icon: Clock,
                class: 'bg-muted text-muted-foreground',
              }
              const Icon = config.icon
              const received = ev.received_at
                ? new Date(ev.received_at).toLocaleString('en-US')
                : '—'

              return (
                <div
                  key={ev.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 p-4"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-sm text-foreground">
                      {ev.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {ev.event_id} · {received}
                    </span>
                    {ev.error_message && (
                      <span className="text-xs text-destructive">
                        {ev.error_message}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                        config.class
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                      {status}
                    </span>
                    {onRetry && status === 'failed' && (
                      <button
                        type="button"
                        onClick={() => onRetry(ev)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
