/**
 * SubscriptionCard - Shows status, next billing date, amount due, actions
 * StudySpark design: pastel gradients, pill-shaped controls
 */

import { Calendar, CreditCard, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { PaymentSubscription } from '@/types/payments'

export interface SubscriptionCardProps {
  subscription: PaymentSubscription
  onManageBilling?: () => void
  onCancel?: (subscription: PaymentSubscription) => void
  onPause?: (subscription: PaymentSubscription) => void
  className?: string
}

const statusColors: Record<string, string> = {
  active: 'bg-success/20 text-success-foreground',
  trialing: 'bg-info/20 text-info-foreground',
  past_due: 'bg-warning/20 text-warning-foreground',
  canceled: 'bg-muted text-muted-foreground',
  paused: 'bg-muted text-muted-foreground',
  incomplete: 'bg-warning/20 text-warning-foreground',
  incomplete_expired: 'bg-destructive/20 text-destructive-foreground',
}

export function SubscriptionCard({
  subscription,
  onManageBilling,
  onCancel,
  onPause,
  className,
}: SubscriptionCardProps) {
  const plan = subscription.plan
  const planName = plan?.name ?? 'Subscription'
  const amount = plan?.amount ?? 0
  const currency = plan?.currency ?? 'USD'
  const interval = plan?.interval ?? 'month'
  const status = subscription.status ?? 'active'
  const statusClass = statusColors[status] ?? 'bg-muted text-muted-foreground'
  const nextBilling = subscription.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <Card
      className={cn(
        'overflow-hidden border-2 transition-all duration-300',
        'bg-gradient-to-br from-[rgb(var(--peach-light))]/20 to-[rgb(var(--card))]',
        'hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">{planName}</CardTitle>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium capitalize',
              statusClass
            )}
          >
            {status}
          </span>
          {(onCancel || onPause) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" aria-label="More actions" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onManageBilling && (
                  <DropdownMenuItem onClick={onManageBilling}>
                    Manage billing
                  </DropdownMenuItem>
                )}
                {onPause && status === 'active' && (
                  <DropdownMenuItem onClick={() => onPause(subscription)}>
                    Pause subscription
                  </DropdownMenuItem>
                )}
                {onCancel && (
                  <DropdownMenuItem
                    onClick={() => onCancel(subscription)}
                    className="text-destructive focus:text-destructive"
                  >
                    Cancel subscription
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CreditCard className="h-4 w-4" aria-hidden />
          <span>
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency,
            }).format(amount)}
            /{interval}
          </span>
        </div>
        {nextBilling && (status === 'active' || status === 'trialing') && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" aria-hidden />
            <span>Next billing: {nextBilling}</span>
          </div>
        )}
        {onManageBilling && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={onManageBilling}
          >
            Manage in Billing Portal
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
