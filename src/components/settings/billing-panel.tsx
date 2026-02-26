import { useState } from 'react'
import { CreditCard, FileText, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmationModal } from '@/components/settings/confirmation-modal'
import { toast } from 'sonner'
import type { BillingInfo, Invoice } from '@/types/settings'
import { fetchBillingInfo, changePlan, cancelSubscription } from '@/api/settings'

export interface BillingPanelProps {
  billing: BillingInfo | null
  invoices: Invoice[]
  onBillingChange: (billing: BillingInfo) => void
  onInvoicesChange?: (invoices: Invoice[]) => void
}

export function BillingPanel({
  billing,
  invoices,
  onBillingChange,
}: BillingPanelProps) {
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [upgrading, setUpgrading] = useState(false)

  const safeBilling = billing ?? {
    planId: 'free',
    planName: 'Free',
    price: 0,
    currency: 'USD',
    usage: { studies: 0, limit: 3 },
  }
  const safeInvoices = Array.isArray(invoices) ? invoices : []

  const usage = safeBilling.usage ?? { studies: 0, limit: 3 }
  const nextBilling = safeBilling.nextBillingDate
    ? new Date(safeBilling.nextBillingDate).toLocaleDateString()
    : null

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      const updated = await changePlan('pro')
      if (updated) {
        onBillingChange(updated)
        toast.success('Plan upgraded')
      } else {
        toast.error('Failed to upgrade')
      }
    } catch {
      toast.error('Failed to upgrade')
    } finally {
      setUpgrading(false)
    }
  }

  const handleCancelConfirm = async () => {
    setCancelLoading(true)
    try {
      const ok = await cancelSubscription()
      if (ok) {
        const updated = await fetchBillingInfo()
        if (updated) onBillingChange(updated)
        setCancelOpen(false)
        toast.success('Subscription cancelled')
      } else {
        toast.error('Failed to cancel')
      }
    } catch {
      toast.error('Failed to cancel')
    } finally {
      setCancelLoading(false)
    }
  }

  const isFree = safeBilling.planId === 'free'

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Billing & subscription</CardTitle>
          <CardDescription>
            Manage your plan, payment method, and invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-[rgb(var(--peach-light))]/30 to-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current plan</p>
                <p className="text-2xl font-bold text-foreground">{safeBilling.planName}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {usage.studies} / {usage.limit} studies used
                </p>
                {nextBilling && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Next billing: {nextBilling}
                  </p>
                )}
              </div>
              <Badge variant={isFree ? 'secondary' : 'default'} className="text-sm">
                ${safeBilling.price}/mo
              </Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {isFree && (
                <Button onClick={handleUpgrade} disabled={upgrading} className="rounded-full">
                  {upgrading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Upgrade to Pro
                </Button>
              )}
              {!isFree && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCancelOpen(true)}
                  className="rounded-full"
                >
                  Cancel subscription
                </Button>
              )}
            </div>
          </div>

          <div>
            <h4 className="mb-2 flex items-center gap-2 font-medium">
              <FileText className="h-4 w-4" />
              Invoices
            </h4>
            {safeInvoices.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                No invoices yet
              </p>
            ) : (
              <div className="space-y-2">
                {safeInvoices.slice(0, 5).map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
                  >
                    <span className="text-sm">
                      {new Date(inv.billingPeriodStart).toLocaleDateString()} –{' '}
                      {new Date(inv.billingPeriodEnd).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        ${inv.amount} {inv.currency}
                      </span>
                      <Badge
                        variant={
                          inv.status === 'paid'
                            ? 'success'
                            : inv.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {inv.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="mb-2 flex items-center gap-2 font-medium">
              <CreditCard className="h-4 w-4" />
              Payment method
            </h4>
            <Button variant="outline" size="sm" className="rounded-full">
              Update payment method
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel subscription"
        description="Your subscription will remain active until the end of the current billing period. You can resubscribe anytime."
        confirmLabel="Cancel subscription"
        variant="destructive"
        onConfirm={handleCancelConfirm}
        isLoading={cancelLoading}
      />
    </>
  )
}
