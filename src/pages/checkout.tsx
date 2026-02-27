import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ShoppingBag, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  PlanSelector,
  OrderSummaryCard,
  BillingForm,
  PromoCodeInput,
  PaymentSection,
  ConfirmationPanel,
  ErrorBanner,
  ProgressIndicator,
  type CheckoutStep,
} from '@/components/checkout'
import {
  fetchExportItems,
  validatePromoCode,
  createCheckoutSession,
  verifyPayment,
} from '@/api/checkout'
import { MOCK_EXPORT_ITEMS } from '@/data/checkout-mock'
import type {
  ExportItem,
  PlanOption,
  BillingDetails,
  PromoValidation,
  Order,
} from '@/types/checkout'

const TAX_RATE = 0
const PLANS_FOR_DISPLAY: PlanOption[] = [
  {
    id: 'one-time',
    type: 'one-time',
    price: 0,
    description: 'Pay once for your selected export packs.',
    benefits: ['Instant download', 'No recurring charges', 'Keep forever'],
  },
  {
    id: 'monthly',
    type: 'subscription',
    interval: 'monthly',
    price: 4.99,
    description: 'Unlimited exports every month.',
    benefits: ['Unlimited PDF exports', 'Priority support', 'Cancel anytime'],
  },
  {
    id: 'annual',
    type: 'subscription',
    interval: 'annual',
    price: 39.99,
    description: 'Best value — save 33% vs monthly.',
    benefits: ['Unlimited exports', '2 months free', 'Priority support'],
  },
]

function CheckoutSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-3" role="status" aria-label="Loading checkout">
      <div className="lg:col-span-2 space-y-6">
        <Card className="overflow-hidden border-2 border-border/60">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-4 w-72 max-w-full" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full rounded-xl" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-2xl" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-5 w-32" />
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-2/3 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-full" />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        <Card className="overflow-hidden rounded-xl shadow-card">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full rounded-full" />
          </CardContent>
        </Card>
      </div>
      <span className="sr-only">Loading checkout content…</span>
    </div>
  )
}

function computeTotals(
  items: ExportItem[],
  plan: PlanOption | null,
  promo: PromoValidation | null
) {
  const safeItems = Array.isArray(items) ? items : []
  const itemsSubtotal = safeItems.reduce(
    (sum, i) => sum + (i.price ?? 0) * (i.quantity ?? 1),
    0
  )
  const planPrice = plan?.type === 'subscription' ? (plan?.price ?? 0) : 0
  const subtotal = plan?.type === 'one-time' ? itemsSubtotal : planPrice
  let discount = 0
  if (promo?.valid && promo.value != null) {
    if (promo.discountType === 'percent') {
      discount = (subtotal * promo.value) / 100
    } else {
      discount = Math.min(promo.value, subtotal)
    }
  }
  const afterDiscount = Math.max(0, subtotal - discount)
  const tax = afterDiscount * TAX_RATE
  const total = afterDiscount + tax
  return { subtotal, discount, tax, total }
}

export function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const [items, setItems] = useState<ExportItem[]>([])
  const [planOptions] = useState<PlanOption[]>(PLANS_FOR_DISPLAY)
  const [purchaseType, setPurchaseType] = useState<'one-time' | 'subscription'>('one-time')
  const [selectedPlan, setSelectedPlan] = useState<PlanOption | null>(null)
  const [promoCode, setPromoCode] = useState('')
  const [promoResult, setPromoResult] = useState<PromoValidation | null>(null)
  const [promoValidating, setPromoValidating] = useState(false)
  const [billingDetails, setBillingDetails] = useState<Partial<BillingDetails>>({})
  const [billingValid, setBillingValid] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [step, setStep] = useState<CheckoutStep>('cart')
  const [loading, setLoading] = useState(false)
  const [itemsLoading, setItemsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { subtotal, discount, tax, total } = computeTotals(items, selectedPlan, promoResult)

  useEffect(() => {
    const ids = searchParams.get('items')
    const list = ids ? ids.split(',').filter(Boolean) : []
    async function load() {
      setItemsLoading(true)
      try {
        const data = await fetchExportItems()
        const fetched = Array.isArray(data) ? data : []
        if (fetched.length === 0) {
          setItems(
            list.length > 0
              ? MOCK_EXPORT_ITEMS.filter((i: ExportItem) => list.includes(i.id))
              : MOCK_EXPORT_ITEMS
          )
        } else {
          const filtered =
            list.length > 0
              ? fetched.filter((i: ExportItem) => list.includes(i.id))
              : fetched
          setItems(filtered.map((i: ExportItem) => ({ ...i, quantity: 1 })))
        }
      } catch {
        setItems(
          list.length > 0
            ? MOCK_EXPORT_ITEMS.filter((i: ExportItem) => list.includes(i.id))
            : MOCK_EXPORT_ITEMS
        )
        toast.error('Could not load items. Showing sample data.')
      } finally {
        setItemsLoading(false)
      }
      if (!selectedPlan) {
        setSelectedPlan(PLANS_FOR_DISPLAY[0] ?? null)
      }
    }
    load()
  }, [searchParams])

  const handlePromoApply = useCallback(
    async (code: string) => {
      setPromoValidating(true)
      setPromoResult(null)
      try {
        const result = await validatePromoCode(code, subtotal)
        setPromoResult(result ?? { valid: false })
      } catch {
        setPromoResult({ valid: false, message: 'Could not validate code' })
        toast.error('Could not validate promo code')
      } finally {
        setPromoValidating(false)
      }
    },
    [subtotal]
  )

  const handleBillingChange = useCallback((data: Partial<BillingDetails>) => {
    setBillingDetails((prev) => ({ ...prev, ...data }))
  }, [])

  const handleCreateSession = useCallback(async () => {
    setError(null)
    if (!billingValid || !billingDetails.name || !billingDetails.email) {
      setError('Please fill in all required billing fields.')
      return
    }
    const safeItems = Array.isArray(items) ? items : []
    if (safeItems.length === 0 && selectedPlan?.type === 'one-time') {
      setError('Please add items to your cart.')
      return
    }
    if (!selectedPlan) {
      setError('Please select a purchase plan.')
      return
    }
    setLoading(true)
    try {
      const res = await createCheckoutSession({
        items: safeItems,
        plan: selectedPlan,
        promoCode: promoResult?.valid ? promoCode : undefined,
        billingDetails: {
          name: billingDetails.name,
          email: billingDetails.email,
          address: billingDetails.address,
        },
      })
      setOrderId(res.orderId ?? null)
      setClientSecret(res.paymentIntentClientSecret ?? null)
      setStep('payment')
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [
    items,
    selectedPlan,
    promoResult,
    promoCode,
    billingDetails,
    billingValid,
  ])

  const handlePaymentSuccess = useCallback(
    async (_paymentIntentId?: string) => {
      if (!orderId) return
      setLoading(true)
      setError(null)
      try {
        const verify = await verifyPayment(orderId)
        if (verify.success) {
          const ord = verify.order ?? {
            id: orderId,
            totalAmount: total,
            currency: 'USD',
            status: 'paid' as const,
            items: items,
            createdAt: new Date().toISOString(),
            downloadLinks: verify.downloadLinks ?? [],
          }
          setOrder(ord)
          setStep('confirmation')
          toast.success('Payment successful!')
        } else {
          setOrder({
            id: orderId,
            totalAmount: total,
            currency: 'USD',
            status: 'paid',
            items: items,
            createdAt: new Date().toISOString(),
            downloadLinks: verify.downloadLinks ?? [],
          })
          setStep('confirmation')
          toast.success('Order placed.')
        }
      } catch {
        const msg = 'Could not verify payment'
        setError(msg)
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    },
    [orderId, total, items]
  )

  const handleMockComplete = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const mockOrder: Order = {
        id: orderId ?? `ord_mock_${Date.now()}`,
        totalAmount: total,
        currency: 'USD',
        status: 'paid',
        items: items,
        promoCode: promoCode || undefined,
        createdAt: new Date().toISOString(),
        downloadLinks: ['#'],
      }
      setOrder(mockOrder)
      setStep('confirmation')
      toast.success('Order completed!')
    } catch {
      const msg = 'Something went wrong'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [orderId, total, items, promoCode])

  const safeItems = Array.isArray(items) ? items : []
  const hasItems = safeItems.length > 0 || selectedPlan?.type === 'subscription'
  const canContinue =
    hasItems &&
    selectedPlan &&
    billingValid &&
    !loading &&
    billingDetails.name &&
    billingDetails.email

  if (order && step === 'confirmation') {
    return (
      <div className="flex flex-1 flex-col p-6">
        <header className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Checkout
          </h1>
          <p className="mt-1 text-muted-foreground">
            Complete your purchase for export packs and upgrades.
          </p>
        </header>
        <div className="mx-auto max-w-2xl animate-fade-in">
          <ProgressIndicator currentStep="confirmation" />
          <ConfirmationPanel
            order={order}
            onCopyOrderId={() => toast.success('Order ID copied')}
            onEmailReceipt={() => toast.info('Receipt will be sent to your email')}
          />
          <div className="mt-6 text-center">
            <Link to="/dashboard">
              <Button
                variant="outline"
                className="rounded-full"
                aria-label="Return to dashboard"
              >
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col p-6">
      <header className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Checkout
        </h1>
        <p className="mt-1 text-muted-foreground">
          Complete your purchase for export packs and upgrades.
        </p>
      </header>

      <div className="space-y-8">
        <ProgressIndicator currentStep={step} />

        {error && (
          <ErrorBanner
            message={error}
            onDismiss={() => setError(null)}
            onRetry={() => setError(null)}
          />
        )}

        {itemsLoading ? (
          <CheckoutSkeleton />
        ) : !hasItems ? (
          <Card className="border-2 border-dashed border-border bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" aria-hidden />
              <h3 className="text-lg font-semibold text-foreground">Your cart is empty</h3>
              <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                Add export packs from the Study Library or Create Study to get started.
              </p>
              <Link to="/dashboard/studies">
                <Button
                  variant="accent"
                  className="mt-6 rounded-full"
                  aria-label="Browse studies to add export packs"
                >
                  Browse Studies
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--peach-light))]/20 to-[rgb(var(--card))]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Sparkles className="h-6 w-6 text-primary" />
                    Export & Checkout
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Choose your plan and complete your purchase securely.
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  <PlanSelector
                    options={planOptions}
                    selectedPlan={selectedPlan}
                    onSelect={setSelectedPlan}
                    purchaseType={purchaseType}
                    onPurchaseTypeChange={(type) => {
                      setPurchaseType(type)
                      const match = planOptions.find((p: PlanOption) => p.type === type)
                      if (match) setSelectedPlan(match)
                    }}
                  />

                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Billing details</h4>
                    <BillingForm
                      defaultValues={billingDetails}
                      onChange={handleBillingChange}
                      onValidationChange={setBillingValid}
                    />
                  </div>

                  {step === 'payment' && (
                    <PaymentSection
                      clientSecret={clientSecret}
                      amount={Math.round(total * 100)}
                      currency="USD"
                      onSuccess={handlePaymentSuccess}
                      onError={(msg) => setError(msg)}
                      disabled={loading}
                      mockMode={!clientSecret}
                      onMockComplete={handleMockComplete}
                      isMockSubmitting={loading}
                    />
                  )}

                  {step === 'cart' && (
                    <Button
                      type="button"
                      variant="accent"
                      size="lg"
                      disabled={!canContinue}
                      onClick={handleCreateSession}
                      className="w-full rounded-full text-base"
                      aria-label={
                        loading
                          ? 'Processing your order'
                          : `Continue to payment — ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}`
                      }
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
                          Processing…
                        </>
                      ) : (
                        `Continue to payment — ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}`
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <OrderSummaryCard
                items={safeItems}
                subtotal={subtotal}
                discount={discount}
                tax={tax}
                total={total}
                currency="USD"
              />

              <PromoCodeInput
                value={promoCode}
                onChange={setPromoCode}
                onApply={handlePromoApply}
                isValidating={promoValidating}
                isValid={promoResult?.valid}
                message={
                  promoResult?.valid === false ? promoResult?.message : undefined
                }
                discountLabel={
                  promoResult?.valid && promoResult.value != null
                    ? `You save ${promoResult.discountType === 'percent' ? `${promoResult.value}%` : `$${promoResult.value}`}`
                    : undefined
                }
                disabled={loading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
