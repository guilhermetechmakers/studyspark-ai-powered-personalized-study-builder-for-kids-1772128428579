import { useState } from 'react'
import { CheckCircle2, Download, Mail, Copy, Loader2, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Order } from '@/types/checkout'

export interface ConfirmationPanelProps {
  /** Full order object (preferred) */
  order?: Order
  /** Legacy: order ID */
  orderId?: string
  /** Legacy: total amount */
  totalAmount?: number
  /** Legacy: currency */
  currency?: string
  /** Legacy: download links */
  downloadLinks?: string[]
  onCopyOrderId?: () => void
  onEmailReceipt?: () => void
  isEmailing?: boolean
  className?: string
}

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function ConfirmationPanel({
  order,
  orderId,
  totalAmount,
  currency = 'USD',
  downloadLinks: downloadLinksProp,
  onCopyOrderId,
  onEmailReceipt,
  isEmailing = false,
  className,
}: ConfirmationPanelProps) {
  const [copied, setCopied] = useState(false)
  const items = Array.isArray(order?.items) ? order.items : []
  const downloadLinks = Array.isArray(order?.downloadLinks)
    ? order.downloadLinks
    : Array.isArray(downloadLinksProp)
      ? downloadLinksProp
      : []
  const displayAmount = order?.totalAmount ?? totalAmount ?? 0
  const displayCurrency = order?.currency ?? currency
  const displayOrderId = order?.id ?? orderId ?? 'N/A'

  const receiptText = [
    `Order #${displayOrderId}`,
    `Total: ${formatCurrency(displayAmount, displayCurrency)}`,
    `Status: ${order?.status ?? 'paid'}`,
    '',
    'Items:',
    ...items.map((i) => `- ${i.name} × ${i.quantity ?? 1}: ${formatCurrency((i.price ?? 0) * (i.quantity ?? 1), i.currency ?? 'USD')}`),
  ].join('\n')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(receiptText)
      setCopied(true)
      if (onCopyOrderId) onCopyOrderId(); else toast.success('Order details copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const isEmpty = items.length === 0 && downloadLinks.length === 0

  return (
    <Card
      className={cn(
        'overflow-hidden border-2 border-success/30 bg-gradient-to-br from-[rgb(var(--success))]/10 to-[rgb(var(--peach-light))]/30 dark:from-[rgb(var(--success))]/5 dark:to-[rgb(var(--peach-light))]/10',
        className
      )}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
            <CheckCircle2 className="h-7 w-7 text-success-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Thank you!</h2>
            <p className="text-sm text-muted-foreground">
              Your order has been confirmed.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-xl border border-border bg-card/50 p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Order ID
              </p>
              <p className="font-mono text-sm font-medium">{displayOrderId}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="rounded-full shrink-0"
              aria-label={copied ? 'Order details copied' : 'Copy order details'}
            >
              <Copy className="mr-2 h-4 w-4" aria-hidden />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <p className="mt-2 text-lg font-bold text-primary">
            {formatCurrency(displayAmount, displayCurrency)}
          </p>
        </div>

        {downloadLinks.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Download your exports</h3>
            <div className="flex flex-wrap gap-2">
              {downloadLinks.map((link, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  asChild
                  className="rounded-full"
                  aria-label={`Download export ${downloadLinks.length > 1 ? `file ${i + 1}` : 'file'}`}
                >
                  <a href={link} download target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" aria-hidden />
                    Download {downloadLinks.length > 1 ? `#${i + 1}` : ''}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}

        {downloadLinks.length === 0 && items.length > 0 && (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Your export files are being prepared. You will receive download links via email.
            </p>
          </div>
        )}

        {isEmpty && (
          <div
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center"
            role="status"
            aria-label="Order summary empty"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No items in this order</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Your order was confirmed successfully. Check your email for details.
            </p>
          </div>
        )}

        {onEmailReceipt && (
          <Button
            variant="secondary"
            className="w-full rounded-full"
            onClick={onEmailReceipt}
            disabled={isEmailing}
            aria-busy={isEmailing}
            aria-label={isEmailing ? 'Sending receipt' : 'Email receipt'}
          >
            {isEmailing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            {isEmailing ? 'Sending…' : 'Email receipt'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
