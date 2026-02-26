/**
 * InvoiceList - Searchable, sortable, downloadable invoices
 * StudySpark design: pastel cards, pill-shaped status badges
 */

import { Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { PaymentInvoice } from '@/types/payments'

export interface InvoiceListProps {
  invoices: PaymentInvoice[]
  isLoading?: boolean
  onDownload?: (invoice: PaymentInvoice) => void
  onSearch?: (query: string) => void
  searchPlaceholder?: string
  className?: string
}

const statusColors: Record<string, string> = {
  paid: 'bg-success/20 text-success-foreground',
  open: 'bg-warning/20 text-warning-foreground',
  draft: 'bg-muted text-muted-foreground',
  void: 'bg-muted text-muted-foreground',
  uncollectible: 'bg-destructive/20 text-destructive-foreground',
}

export function InvoiceList({
  invoices = [],
  isLoading = false,
  onDownload,
  onSearch,
  searchPlaceholder = 'Search invoices...',
  className,
}: InvoiceListProps) {
  const safeInvoices = Array.isArray(invoices) ? invoices : []

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader>
          <div className="h-6 w-32 rounded bg-muted" />
          <div className="h-4 w-48 rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" aria-hidden />
          Billing History
        </CardTitle>
        {onSearch && (
          <Input
            type="search"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch(e.target.value)}
            className="mt-2 max-w-sm rounded-full"
            aria-label="Search invoices"
          />
        )}
      </CardHeader>
      <CardContent>
        {safeInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium text-foreground">No invoices yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your invoices will appear here after your first payment.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {safeInvoices.map((inv) => {
              const status = inv.status ?? 'draft'
              const statusClass = statusColors[status] ?? 'bg-muted text-muted-foreground'
              const date = inv.created_at
                ? new Date(inv.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '—'

              return (
                <div
                  key={inv.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-foreground">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: inv.currency ?? 'USD',
                      }).format(inv.amount_due ?? 0)}
                    </span>
                    <span className="text-sm text-muted-foreground">{date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium capitalize',
                        statusClass
                      )}
                    >
                      {status}
                    </span>
                    {onDownload && (inv.pdf_url || inv.hosted_invoice_url) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => onDownload(inv)}
                        aria-label={`Download invoice ${inv.id}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
