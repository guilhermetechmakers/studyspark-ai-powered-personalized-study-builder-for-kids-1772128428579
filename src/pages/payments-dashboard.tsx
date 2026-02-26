import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CreditCard,
  FileText,
  ExternalLink,
  Loader2,
  Sparkles,
  Check,
  Calendar,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  fetchPlans,
  fetchSubscriptions,
  fetchInvoices,
  getBillingPortalUrl,
  createSubscription,
} from '@/api/payments'
import type { PaymentPlan, PaymentSubscription, PaymentInvoice } from '@/types/payments'

export function PaymentsDashboardPage() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<PaymentPlan[]>([])
  const [subscriptions, setSubscriptions] = useState<PaymentSubscription[]>([])
  const [invoices, setInvoices] = useState<PaymentInvoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [subscribeLoading, setSubscribeLoading] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [pList, sList, invRes] = await Promise.all([
        fetchPlans(),
        fetchSubscriptions(),
        fetchInvoices({ limit: 10 }),
      ])
      setPlans(Array.isArray(pList) ? pList : [])
      setSubscriptions(Array.isArray(sList) ? sList : [])
      setInvoices(Array.isArray(invRes?.data) ? invRes.data : [])
    } catch {
      toast.error('Failed to load payment data')
      setPlans([])
      setSubscriptions([])
      setInvoices([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleBillingPortal = useCallback(async () => {
    setPortalLoading(true)
    try {
      const url = await getBillingPortalUrl(
        `${window.location.origin}/dashboard/payments`
      )
      if (url) {
        window.location.href = url
      } else {
        toast.error('Billing portal not available')
      }
    } catch {
      toast.error('Could not open billing portal')
    } finally {
      setPortalLoading(false)
    }
  }, [])

  const handleSubscribe = useCallback(
    async (planId: string) => {
      setSubscribeLoading(planId)
      try {
        const res = await createSubscription({
          plan_id: planId,
          success_url: `${window.location.origin}/dashboard/payments?success=1`,
          cancel_url: `${window.location.origin}/dashboard/payments`,
        })
        if (res?.url) {
          window.location.href = res.url
        } else {
          toast.error('Checkout not configured. Please add Stripe price IDs to plans.')
        }
      } catch {
        toast.error('Failed to start checkout')
      } finally {
        setSubscribeLoading(null)
      }
    },
    []
  )

  const activeSubscription = (subscriptions ?? []).find(
    (s) => s.status === 'active' || s.status === 'trialing'
  )
  const paidPlans = (plans ?? []).filter((p) => (p.amount ?? 0) > 0)

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <header className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Payments & Billing
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your subscription, payment methods, and invoices.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--peach-light))]/20 to-[rgb(var(--card))] transition-all duration-300 hover:shadow-card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CreditCard className="h-6 w-6 text-primary" />
                Current subscription
              </CardTitle>
              <CardDescription>
                Your plan and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-12 w-48 rounded-full" />
                </div>
              ) : activeSubscription ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        {(activeSubscription.plan as PaymentPlan)?.name ?? 'Pro'}
                      </p>
                      <Badge
                        variant={
                          activeSubscription.status === 'trialing'
                            ? 'secondary'
                            : 'default'
                        }
                        className="mt-2 rounded-full"
                      >
                        {activeSubscription.status === 'trialing'
                          ? 'Trial'
                          : 'Active'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">
                        $
                        {Number(
                          (activeSubscription.plan as PaymentPlan)?.amount ?? 0
                        )}
                        <span className="text-sm font-normal text-muted-foreground">
                          /
                          {(activeSubscription.plan as PaymentPlan)?.interval ===
                          'year'
                            ? 'yr'
                            : 'mo'}
                        </span>
                      </p>
                      {activeSubscription.current_period_end && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Renews{' '}
                          {new Date(
                            activeSubscription.current_period_end
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-2"
                    onClick={handleBillingPortal}
                    disabled={portalLoading}
                  >
                    {portalLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    Manage billing
                  </Button>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-8 text-center">
                  <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 font-medium text-foreground">
                    No active subscription
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose a plan below to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-2 border-border/60 transition-all duration-300 hover:shadow-card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-6 w-6 text-accent" />
                Available plans
              </CardTitle>
              <CardDescription>
                Upgrade to unlock more features
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-40 rounded-2xl" />
                  ))}
                </div>
              ) : paidPlans.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-8 text-center">
                  <p className="text-muted-foreground">
                    No paid plans available. Contact support for options.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {paidPlans.map((plan) => {
                    const isActive =
                      activeSubscription?.plan_id === plan.id ||
                      (activeSubscription?.plan as PaymentPlan)?.id === plan.id
                    const hasTrial = (plan.trial_period_days ?? 0) > 0
                    return (
                      <Card
                        key={plan.id}
                        className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                          isActive
                            ? 'border-primary bg-primary/5'
                            : 'border-border/60 hover:border-primary/50 hover:shadow-card-hover'
                        }`}
                      >
                        <CardContent className="p-6">
                          {hasTrial && (
                            <Badge
                              variant="secondary"
                              className="absolute right-4 top-4 rounded-full"
                            >
                              {plan.trial_period_days} days free
                            </Badge>
                          )}
                          <p className="text-lg font-bold text-foreground">
                            {plan.name}
                          </p>
                          <p className="mt-2 text-2xl font-bold text-foreground">
                            ${Number(plan.amount)}
                            <span className="text-sm font-normal text-muted-foreground">
                              /{plan.interval === 'year' ? 'yr' : 'mo'}
                            </span>
                          </p>
                          <Button
                            variant={isActive ? 'outline' : 'accent'}
                            size="sm"
                            className="mt-4 w-full rounded-full"
                            disabled={isActive || !!subscribeLoading}
                            onClick={() => handleSubscribe(plan.id)}
                          >
                            {subscribeLoading === plan.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isActive ? (
                              <>
                                <Check className="h-4 w-4" />
                                Current plan
                              </>
                            ) : (
                              'Subscribe'
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden border-2 border-border/60 transition-all duration-300 hover:shadow-card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Billing
              </CardTitle>
              <CardDescription>
                Manage payment methods and invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="default"
                className="w-full rounded-full gap-2"
                onClick={handleBillingPortal}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                Open billing portal
              </Button>
              <Button
                variant="ghost"
                className="w-full rounded-full gap-2"
                onClick={() => navigate('/dashboard/payments/invoices')}
              >
                View invoices
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-2 border-border/60 transition-all duration-300 hover:shadow-card-hover">
            <CardHeader>
              <CardTitle className="text-lg">Recent invoices</CardTitle>
              <CardDescription>
                Your latest billing history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 rounded-xl" />
                  ))}
                </div>
              ) : (invoices ?? []).length === 0 ? (
                <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                  No invoices yet
                </p>
              ) : (
                <div className="space-y-2">
                  {(invoices ?? []).slice(0, 5).map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between rounded-xl border border-border px-4 py-3 transition-colors hover:bg-muted/30"
                    >
                      <span className="text-sm text-muted-foreground">
                        {inv.created_at
                          ? new Date(inv.created_at).toLocaleDateString()
                          : '—'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          ${Number(inv.amount_due)} {inv.currency}
                        </span>
                        <Badge
                          variant={
                            inv.status === 'paid'
                              ? 'default'
                              : inv.status === 'open'
                                ? 'secondary'
                                : 'outline'
                          }
                          className="rounded-full text-xs"
                        >
                          {inv.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full rounded-full"
                    onClick={() => navigate('/dashboard/payments/invoices')}
                  >
                    View all invoices
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
