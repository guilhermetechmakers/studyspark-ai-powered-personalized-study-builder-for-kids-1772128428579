import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { PricingTier } from '@/types/landing'

export interface TierCardProps {
  tier: PricingTier
  className?: string
}

function formatPrice(price: number, currency?: string): string {
  if (price === 0) return '$0'
  return currency === 'USD' ? `$${price}` : `${price} ${currency ?? ''}`.trim()
}

export function TierCard({ tier, className }: TierCardProps) {
  const features = Array.isArray(tier.features) ? tier.features : []
  const ctaLabel = tier.ctaLabel ?? 'Sign Up'

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-300 hover:-translate-y-1',
        tier.highlighted && 'border-primary shadow-lg ring-2 ring-primary/20',
        className
      )}
    >
      <CardContent className="p-6">
        {tier.highlighted && (
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Most Popular
          </span>
        )}
        <h3 className="mt-4 text-xl font-bold text-foreground">{tier.name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold">
            {formatPrice(tier.price, tier.currency)}
          </span>
          <span className="text-muted-foreground">
            {tier.price === 0 ? '/forever' : '/month'}
          </span>
        </div>
        {tier.description && (
          <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
        )}
        <ul className="mt-6 space-y-3">
          {(features ?? []).map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              {f}
            </li>
          ))}
        </ul>
        <Button
          className="mt-6 w-full"
          variant={tier.highlighted ? 'default' : 'outline'}
          asChild
        >
          <Link to="/signup">{ctaLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
