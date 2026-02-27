import { Check, Package, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/settings/empty-state'
import { cn } from '@/lib/utils'
import type { PlanOption } from '@/types/checkout'

export interface PlanSelectorProps {
  options: PlanOption[]
  selectedPlan: PlanOption | null
  onSelect: (plan: PlanOption) => void
  purchaseType: 'one-time' | 'subscription'
  onPurchaseTypeChange?: (type: 'one-time' | 'subscription') => void
  /** Optional loading state */
  isLoading?: boolean
  /** Optional error message */
  error?: string | null
  /** Optional retry callback for error state */
  onRetry?: () => void
  className?: string
}

export function PlanSelector({
  options = [],
  selectedPlan,
  onSelect,
  purchaseType,
  onPurchaseTypeChange,
  isLoading = false,
  error = null,
  onRetry,
  className,
}: PlanSelectorProps) {
  const safeOptions = Array.isArray(options) ? options : []
  const relevantOptions = safeOptions.filter((plan) =>
    purchaseType === 'one-time'
      ? plan.type === 'one-time'
      : plan.type === 'subscription'
  )
  const hasNoPlans = relevantOptions.length === 0

  return (
    <div className={cn('space-y-4', className)}>
      {onPurchaseTypeChange && (
        <div
          role="tablist"
          aria-label="Purchase type"
          className="flex gap-2 rounded-xl bg-muted/50 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={purchaseType === 'one-time'}
            onClick={() => onPurchaseTypeChange('one-time')}
            className={cn(
              'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
              purchaseType === 'one-time'
                ? 'bg-card text-foreground shadow-card'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            One-time Purchase
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={purchaseType === 'subscription'}
            onClick={() => onPurchaseTypeChange('subscription')}
            className={cn(
              'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
              purchaseType === 'subscription'
                ? 'bg-card text-foreground shadow-card'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Subscribe
          </button>
        </div>
      )}

      {error ? (
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load plans"
          description={error}
          actionLabel={onRetry ? 'Try again' : undefined}
          onAction={onRetry}
          className="rounded-2xl border border-dashed border-border bg-muted/30 py-12"
        />
      ) : isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4 rounded-md bg-muted" />
                    <Skeleton className="h-3 w-1/4 rounded-md bg-muted" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-md bg-muted" />
                </div>
                <ul className="mt-4 space-y-2" aria-hidden>
                  {[1, 2, 3].map((j) => (
                    <li key={j} className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 shrink-0 rounded bg-muted" />
                      <Skeleton className="h-4 flex-1 rounded-md bg-muted" />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : hasNoPlans ? (
        <EmptyState
          icon={Package}
          title="No plans available"
          description={
            safeOptions.length > 0
              ? `No ${purchaseType === 'one-time' ? 'one-time' : 'subscription'} plans at the moment. Try switching the purchase type above.`
              : 'No plans have been configured yet. Check back later.'
          }
          className="rounded-2xl border border-dashed border-border bg-muted/30 py-12"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {relevantOptions.map((plan) => {
            const isSelected = selectedPlan?.id === plan.id
            const benefits = Array.isArray(plan.benefits) ? plan.benefits : []

            return (
              <Card
                key={plan.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(plan)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(plan)
                  }
                }}
                className={cn(
                  'cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5',
                  isSelected &&
                    'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-card-hover'
                )}
                aria-pressed={isSelected}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">
                        {plan.description}
                      </p>
                      {plan.interval && (
                        <span className="text-xs text-muted-foreground capitalize">
                          {plan.interval}
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-bold text-primary">
                      {plan.price === 0
                        ? 'Custom'
                        : `$${plan.price.toFixed(2)}`}
                    </span>
                  </div>
                  <ul className="mt-4 space-y-2" aria-label="Benefits">
                    {(benefits ?? []).map((b, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
