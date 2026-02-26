import { useState } from 'react'
import { CheckCircle2, Download, Mail, Copy } from 'lucide-react'
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

  return (
    <Card
      className={cn(
        'overflow-hidden border-2 border-green-500/30 bg-gradient-to-br from-green-50 to-[rgb(var(--peach-light))]/30 dark:from-green-950/20 dark:to-[rgb(var(--peach-light))]/10',
        className
      )}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
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
            >
              <Copy className="mr-2 h-4 w-4" />
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
                >
                  <a href={link} download target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download {downloadLinks.length > 1 ? `#${i + 1}` : ''}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}

        {downloadLinks.length === 0 && items.length > 0 && (
          <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Your export files are being prepared. You will receive download links via email.
            </p>
          </div>
        )}

        {onEmailReceipt && (
          <Button
            variant="secondary"
            className="w-full rounded-full"
            onClick={onEmailReceipt}
            disabled={isEmailing}
          >
            <Mail className="mr-2 h-4 w-4" />
            {isEmailing ? 'Sending…' : 'Email receipt'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
