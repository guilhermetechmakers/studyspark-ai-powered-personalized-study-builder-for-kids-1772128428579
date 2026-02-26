import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { CreditCard, Lock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? 'pk_test_placeholder'
)

export interface PaymentSectionProps {
  /** PaymentIntent client secret for PaymentElement flow */
  clientSecret?: string | null
  amount?: number
  currency?: string
  onSuccess?: (paymentIntentId?: string) => void
  onError?: (message: string) => void
  /** Legacy: report when card input is complete (for CardElement flow) */
  onChange?: (complete: boolean) => void
  disabled?: boolean
  /** When true, show a mock "Complete order" button for demo/dev without Stripe */
  mockMode?: boolean
  onMockComplete?: () => void
  isMockSubmitting?: boolean
  className?: string
}

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100)
}

function PaymentFormInner({
  onSuccess,
  onError,
  disabled,
}: {
  onSuccess: (paymentIntentId?: string) => void
  onError: (message: string) => void
  disabled?: boolean
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setIsProcessing(true)
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/checkout`,
        },
      })
      if (error) {
        onError(error.message ?? 'Payment failed')
        return
      }
      onSuccess()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: 'tabs',
          wallets: { applePay: 'auto', googlePay: 'auto' },
        }}
      />
      <Button
        type="submit"
        className="w-full rounded-full"
        disabled={!stripe || !elements || disabled || isProcessing}
      >
        {isProcessing ? (
          <>
            <span className="animate-pulse">Processing…</span>
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay Now
          </>
        )}
      </Button>
    </form>
  )
}

function CardElementWrapper({
  onChange,
}: {
  onChange?: (complete: boolean) => void
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-input bg-background px-4 py-3">
        <CardElement
          options={{
            style: {
              base: { fontSize: '16px' },
            },
          }}
          onChange={(e) => onChange?.(e.complete)}
        />
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        <span>PCI compliant. Card details never touch our servers.</span>
      </div>
    </div>
  )
}

export function PaymentSection({
  clientSecret,
  amount = 0,
  currency = 'USD',
  onSuccess,
  onError,
  onChange,
  disabled = false,
  mockMode = false,
  onMockComplete,
  isMockSubmitting = false,
  className,
}: PaymentSectionProps) {
  const hasStripeKey = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  const hasClientSecret = !!clientSecret && clientSecret.length > 20
  const usePaymentElement = hasStripeKey && hasClientSecret
  const useCardElement = hasStripeKey && !clientSecret && onChange

  if (useCardElement) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="bg-gradient-to-br from-[rgb(var(--lavender))]/10 to-[rgb(var(--peach))]/10">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">Payment</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter your card details securely. Card data is tokenized and never stored.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <CardElementWrapper onChange={onChange} />
        </CardContent>
      </Card>
    )
  }

  if (!usePaymentElement) {
    const showMockButton = mockMode && onMockComplete
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="bg-gradient-to-br from-[rgb(var(--lavender))]/10 to-[rgb(var(--peach))]/10">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">Payment</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Secure payment via Stripe. Card details are tokenized and never stored.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          {showMockButton ? (
            <div className="space-y-4">
              <div className="rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Demo mode: Complete order without payment processing.
                </p>
              </div>
              <Button
                onClick={onMockComplete}
                disabled={disabled || isMockSubmitting}
                className="w-full rounded-full"
              >
                {isMockSubmitting ? 'Processing…' : 'Complete order'}
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Payment form will appear when checkout session is created.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Configure VITE_STRIPE_PUBLISHABLE_KEY and backend to enable Stripe.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: 'rgb(91, 87, 165)',
        borderRadius: '12px',
      },
    },
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="bg-gradient-to-br from-[rgb(var(--lavender))]/10 to-[rgb(var(--peach))]/10">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">Payment</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Pay {formatCurrency(amount, currency)} securely. Card data is encrypted and tokenized.
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <Elements stripe={stripePromise} options={options}>
          <PaymentFormInner
            onSuccess={onSuccess ?? (() => undefined)}
            onError={onError ?? (() => undefined)}
            disabled={disabled}
          />
        </Elements>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          <span>PCI compliant. Your card details never touch our servers.</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          <span>256-bit SSL encryption</span>
        </div>
      </CardContent>
    </Card>
  )
}
