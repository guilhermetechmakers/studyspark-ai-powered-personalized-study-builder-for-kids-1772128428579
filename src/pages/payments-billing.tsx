/**
 * Payments Billing - Redirect to Stripe Billing Portal
 */

import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { createBillingPortalSession } from '@/api/payments'

export function PaymentsBillingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    async function openPortal() {
      try {
        const res = await createBillingPortalSession(
          `${window.location.origin}/dashboard/payments`
        )
        if (cancelled) return
        if (res?.url) {
          window.location.href = res.url
        } else {
          toast.error(res?.error ?? 'Could not open billing portal')
          navigate('/dashboard/payments')
        }
      } catch {
        if (!cancelled) {
          toast.error('Could not open billing portal')
          navigate('/dashboard/payments')
        }
      }
    }
    openPortal()
    return () => {
      cancelled = true
    }
  }, [navigate])

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6">
      <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" aria-hidden />
      <p className="text-lg font-medium text-foreground">
        Opening billing portal...
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        You will be redirected to manage your subscription and payment methods.
      </p>
      <Button variant="outline" className="mt-6 rounded-full" asChild>
        <Link to="/dashboard/payments">Cancel</Link>
      </Button>
    </div>
  )
}
