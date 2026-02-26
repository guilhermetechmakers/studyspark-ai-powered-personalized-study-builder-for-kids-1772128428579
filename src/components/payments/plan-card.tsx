/**
 * PlanCard - Displays plan name, price, features, trial, and CTA
 * StudySpark design: pastel gradients, rounded cards, pill-shaped buttons
 */

import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { PaymentPlan } from '@/types/payments'

export interface PlanCardProps {
  plan: PaymentPlan
  onSelect?: (plan: PaymentPlan) => void
  isLoading?: boolean
  isSelected?: boolean
  className?: string
}

export function PlanCard({
  plan,
  onSelect,
  isLoading = false,
  isSelected = false,
  className,
}: PlanCardProps) {
  const features = (plan.metadata?.features as string[]) ?? []
  const benefits = Array.isArray(features) ? features : []
  const hasTrial = (plan.trial_period_days ?? 0) > 0

  return (
    <Card
      className={cn(
        'overflow-hidden border-2 transition-all duration-300',
        'bg-gradient-to-br from-[rgb(var(--peach-light))]/30 to-[rgb(var(--card))]',
        isSelected && 'ring-2 ring-primary ring-offset-2 shadow-card-hover',
        'hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(var(--lavender))] to-[rgb(var(--violet))] text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg">{plan.name}</CardTitle>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-foreground">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: plan.currency ?? 'USD',
            }).format(plan.amount ?? 0)}
          </span>
          {plan.interval && (
            <span className="text-sm text-muted-foreground">
              /{plan.interval}
            </span>
          )}
        </div>
        {hasTrial && (
          <p className="text-sm font-medium text-primary">
            {plan.trial_period_days}-day free trial
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <ul className="space-y-2" aria-label="Plan benefits">
          {benefits.map((b, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              {b}
            </li>
          ))}
        </ul>
      </CardContent>
      {onSelect && (
        <CardFooter className="pt-0">
          <Button
            variant="accent"
            className="w-full rounded-full"
            onClick={() => onSelect(plan)}
            disabled={isLoading}
            aria-label={`Select ${plan.name} plan`}
          >
            {isLoading ? 'Processing...' : 'Get Started'}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
