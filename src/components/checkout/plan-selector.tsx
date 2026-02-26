import { Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { PlanOption } from '@/types/checkout'

export interface PlanSelectorProps {
  options: PlanOption[]
  selectedPlan: PlanOption | null
  onSelect: (plan: PlanOption) => void
  purchaseType: 'one-time' | 'subscription'
  onPurchaseTypeChange?: (type: 'one-time' | 'subscription') => void
  className?: string
}

export function PlanSelector({
  options = [],
  selectedPlan,
  onSelect,
  purchaseType,
  onPurchaseTypeChange,
  className,
}: PlanSelectorProps) {
  const safeOptions = Array.isArray(options) ? options : []

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
                ? 'bg-card text-foreground shadow-sm'
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
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Subscribe
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {safeOptions.map((plan) => {
          const isSelected = selectedPlan?.id === plan.id
          const isRelevant =
            purchaseType === 'one-time'
              ? plan.type === 'one-time'
              : plan.type === 'subscription'

          if (!isRelevant) return null

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
                  'ring-2 ring-primary ring-offset-2 shadow-card-hover',
                className
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
                  {benefits.map((b, i) => (
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
    </div>
  )
}
