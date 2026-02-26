/**
 * Payments Overview - Subscriptions dashboard
 * Lists active plans, next billing date, amount due, manage actions
 */

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CreditCard, FileText, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PlanCard,
  SubscriptionCard,
  BillingPortalButton,
} from '@/components/payments'
import {
  fetchPlans,
  fetchSubscriptions,
  createBillingPortalSession,
  createCheckoutSession,
} from '@/api/payments'
import type { PaymentPlan, PaymentSubscription } from '@/types/payments'

export function PaymentsOverviewPage() {
  const [searchParams] = useSearchParams()
  const success = searchParams.get('success') === '1'

  const [plans, setPlans] = useState<PaymentPlan[]>([])
  const [subscriptions, setSubscriptions] = useState<PaymentSubscription[]>([])
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)
  const [isLoadingSubs, setIsLoadingSubs] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  const loadPlans = useCallback(async () => {
    setIsLoadingPlans(true)
    try {
      const list = await fetchPlans()
      setPlans(list ?? [])
    } catch {
      setPlans([])
    } finally {
      setIsLoadingPlans(false)
    }
  }, [])

  const loadSubscriptions = useCallback(async () => {
    setIsLoadingSubs(true)
    try {
      const list = await fetchSubscriptions()
      setSubscriptions(list ?? [])
    } catch {
      setSubscriptions([])
    } finally {
      setIsLoadingSubs(false)
    }
  }, [])

  useEffect(() => {
    loadPlans()
    loadSubscriptions()
  }, [loadPlans, loadSubscriptions])

  useEffect(() => {
    if (success) {
      toast.success('Subscription activated!')
      loadSubscriptions()
    }
  }, [success, loadSubscriptions])

  const handleManageBilling = useCallback(async () => {
    setPortalLoading(true)
    try {
      const res = await createBillingPortalSession(
        `${window.location.origin}/dashboard/payments`
      )
      if (res?.url) {
        window.location.href = res.url
      } else {
        toast.error(res?.error ?? 'Could not open billing portal')
      }
    } catch {
      toast.error('Could not open billing portal')
    } finally {
      setPortalLoading(false)
    }
  }, [])

  const handleSelectPlan = useCallback(async (plan: PaymentPlan) => {
    setCheckoutLoading(plan.id)
    try {
      const res = await createCheckoutSession({
        plan_id: plan.id,
        success_url: `${window.location.origin}/dashboard/payments?success=1`,
        cancel_url: `${window.location.origin}/dashboard/payments`,
      })
      if (res?.url) {
        window.location.href = res.url
      } else {
        toast.error(res?.error ?? 'Could not start checkout')
      }
    } catch {
      toast.error('Could not start checkout')
    } finally {
      setCheckoutLoading(null)
    }
  }, [])

  const activeSubs = (subscriptions ?? []).filter(
    (s) => s.status === 'active' || s.status === 'trialing'
  )
  const safePlans = Array.isArray(plans) ? plans : []

  return (
    <div className="flex flex-1 flex-col p-6">
      <header className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Payments & Billing
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your subscription and billing details.
        </p>
      </header>

      <div className="space-y-8">
        {isLoadingSubs && activeSubs.length === 0 ? (
          <Card className="animate-pulse">
            <CardContent className="flex h-32 items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading subscriptions...</p>
            </CardContent>
          </Card>
        ) : activeSubs.length > 0 ? (
          <section className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <CreditCard className="h-5 w-5" aria-hidden />
              Current Subscription
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeSubs.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  onManageBilling={handleManageBilling}
                />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              <BillingPortalButton
                onClick={handleManageBilling}
                isLoading={portalLoading}
              />
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/dashboard/payments/invoices">
                  <FileText className="mr-2 h-4 w-4" />
                  View Invoices
                </Link>
              </Button>
            </div>
          </section>
        ) : null}

        <section className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Sparkles className="h-5 w-5" aria-hidden />
            Available Plans
          </h2>
          {isLoadingPlans ? (
            <Card className="animate-pulse">
              <CardContent className="flex h-48 items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading plans...</p>
              </CardContent>
            </Card>
          ) : safePlans.length === 0 ? (
            <Card className="border-2 border-dashed border-border">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Sparkles className="mb-4 h-16 w-16 text-muted-foreground" aria-hidden />
                <h3 className="text-lg font-semibold text-foreground">
                  No plans available
                </h3>
                <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                  Plans will appear here once configured. Contact support for more
                  information.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {safePlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onSelect={handleSelectPlan}
                  isLoading={checkoutLoading === plan.id}
                />
              ))}
            </div>
          )}
        </section>

        {activeSubs.length === 0 && safePlans.length > 0 && (
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-[rgb(var(--peach-light))]/20 to-transparent">
            <CardHeader>
              <CardTitle>Get started with a subscription</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose a plan above to unlock unlimited exports and premium features.
              </p>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  )
}
