import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Sparkles, Loader2, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  fetchPlans,
  createSubscription,
  validateCoupon,
} from '@/api/payments'
import type { PaymentPlan, CouponValidation } from '@/types/payments'

export function PaymentsCheckoutPage() {
  const [searchParams] = useSearchParams()
  const planIdParam = searchParams.get('plan')
  const [plans, setPlans] = useState<PaymentPlan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(planIdParam)
  const [couponCode, setCouponCode] = useState('')
  const [couponResult, setCouponResult] = useState<CouponValidation | null>(null)
  const [couponValidating, setCouponValidating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [subscribeLoading, setSubscribeLoading] = useState(false)

  const loadPlans = useCallback(async () => {
    setIsLoading(true)
    try {
      const list = await fetchPlans()
      setPlans(Array.isArray(list) ? list : [])
      if (!selectedPlanId && list?.length) {
        const paid = list.filter((p) => (p.amount ?? 0) > 0)
        if (planIdParam && paid.some((p) => p.id === planIdParam)) {
          setSelectedPlanId(planIdParam)
        } else if (paid[0]) {
          setSelectedPlanId(paid[0].id)
        }
      }
    } catch {
      toast.error('Failed to load plans')
      setPlans([])
    } finally {
      setIsLoading(false)
    }
  }, [planIdParam, selectedPlanId])

  useEffect(() => {
    loadPlans()
  }, [loadPlans])

  const handleValidateCoupon = useCallback(async () => {
    const code = couponCode.trim()
    if (!code) return
    setCouponValidating(true)
    setCouponResult(null)
    try {
      const selectedPlan = (plans ?? []).find((p) => p.id === selectedPlanId)
      const amount = Number(selectedPlan?.amount ?? 0) * 100
      const result = await validateCoupon({
        code,
        amount,
        planId: selectedPlanId ?? undefined,
      })
      setCouponResult(result)
      if (result.valid) {
        toast.success('Coupon applied')
      } else {
        toast.error(result.message ?? 'Invalid coupon')
      }
    } catch {
      setCouponResult({ valid: false, message: 'Validation failed' })
      toast.error('Could not validate coupon')
    } finally {
      setCouponValidating(false)
    }
  }, [couponCode, selectedPlanId, plans])

  const handleCheckout = useCallback(async () => {
    if (!selectedPlanId) {
      toast.error('Please select a plan')
      return
    }
    setSubscribeLoading(true)
    try {
      const res = await createSubscription({
        plan_id: selectedPlanId,
        coupon_code: couponResult?.valid ? couponCode.trim() : undefined,
        success_url: `${window.location.origin}/dashboard/payments?success=1`,
        cancel_url: `${window.location.origin}/dashboard/payments/checkout`,
      })
      if (res?.url) {
        window.location.href = res.url
      } else {
        toast.error('Checkout not configured. Add Stripe price IDs to plans in Admin.')
      }
    } catch {
      toast.error('Failed to start checkout')
    } finally {
      setSubscribeLoading(false)
    }
  }, [selectedPlanId, couponCode, couponResult])

  const paidPlans = (plans ?? []).filter((p) => (p.amount ?? 0) > 0)
  const selectedPlan = paidPlans.find((p) => p.id === selectedPlanId)
  const amount = Number(selectedPlan?.amount ?? 0)
  const discount = couponResult?.valid ? (couponResult.discount ?? 0) : 0
  const total = Math.max(0, amount - discount)

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <header className="animate-fade-in">
        <Link
          to="/dashboard/payments"
          className="mb-2 inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Payments
        </Link>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Subscribe
        </h1>
        <p className="mt-1 text-muted-foreground">
          Choose a plan and complete checkout securely with Stripe
        </p>
      </header>

      <div className="mx-auto grid w-full max-w-2xl gap-6">
        <Card className="overflow-hidden border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--peach-light))]/20 to-[rgb(var(--card))] transition-all duration-300 hover:shadow-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-6 w-6 text-primary" />
              Select your plan
            </CardTitle>
            <CardDescription>
              All plans include a free trial. Cancel anytime.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
              </div>
            ) : paidPlans.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-8 text-center">
                <p className="text-muted-foreground">No plans available</p>
                <Link to="/dashboard/payments">
                  <Button variant="accent" className="mt-4 rounded-full">
                    Back to Payments
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {paidPlans.map((plan) => {
                  const isSelected = selectedPlanId === plan.id
                  const hasTrial = (plan.trial_period_days ?? 0) > 0
                  return (
                    <Card
                      key={plan.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedPlanId(plan.id)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && setSelectedPlanId(plan.id)
                      }
                      className={`cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? 'border-2 border-primary ring-2 ring-primary/20'
                          : 'border-2 border-border/60 hover:border-primary/50'
                      }`}
                    >
                      <CardContent className="p-6">
                        {hasTrial && (
                          <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {plan.trial_period_days} days free
                          </span>
                        )}
                        <p className="mt-2 font-bold text-foreground">
                          {plan.name}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-foreground">
                          ${Number(plan.amount)}
                          <span className="text-sm font-normal text-muted-foreground">
                            /{plan.interval === 'year' ? 'yr' : 'mo'}
                          </span>
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {paidPlans.length > 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="coupon">Coupon code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="coupon"
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase())
                        setCouponResult(null)
                      }}
                      className="rounded-full"
                    />
                    <Button
                      variant="outline"
                      className="rounded-full gap-1"
                      onClick={handleValidateCoupon}
                      disabled={couponValidating || !couponCode.trim()}
                    >
                      {couponValidating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Tag className="h-4 w-4" />
                      )}
                      Apply
                    </Button>
                  </div>
                  {couponResult?.valid && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {couponResult.message} — You save $
                      {couponResult.discount?.toFixed(2) ?? '0'}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                  <span className="font-medium">Total due today</span>
                  <span className="text-xl font-bold">
                    ${total.toFixed(2)}
                    {amount > 0 && total === 0 && (
                      <span className="ml-1 text-sm font-normal text-muted-foreground">
                        (after trial)
                      </span>
                    )}
                  </span>
                </div>

                <Button
                  variant="accent"
                  size="lg"
                  className="w-full rounded-full"
                  disabled={!selectedPlanId || subscribeLoading}
                  onClick={handleCheckout}
                >
                  {subscribeLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Continue to checkout'
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
