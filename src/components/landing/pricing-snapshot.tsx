import { TierCard } from './tier-card'
import { cn } from '@/lib/utils'
import type { PricingTier } from '@/types/landing'

export interface PricingSnapshotProps {
  tiers?: PricingTier[]
  className?: string
}

export function PricingSnapshot({ tiers = [], className }: PricingSnapshotProps) {
  const tierList = Array.isArray(tiers) ? tiers : []

  return (
    <section id="pricing" className={cn('py-20 md:py-28', className)} aria-labelledby="pricing-heading">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="pricing-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade when you need more.
          </p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {(tierList ?? []).map((tier) => (
            <TierCard key={tier.id} tier={tier} />
          ))}
        </div>
      </div>
    </section>
  )
}
