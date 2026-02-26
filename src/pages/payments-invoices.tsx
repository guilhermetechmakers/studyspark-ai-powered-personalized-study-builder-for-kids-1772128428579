import { useCallback, useEffect, useState } from 'react'
import { FileText, Download, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { fetchInvoices } from '@/api/payments'
import type { PaymentInvoice } from '@/types/payments'

export function PaymentsInvoicesPage() {
  const [invoices, setInvoices] = useState<PaymentInvoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [offset, setOffset] = useState(0)
  const limit = 20

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetchInvoices({ limit, offset })
      const list = Array.isArray(res?.data) ? res.data : []
      setInvoices(list)
      setTotalCount(res?.count ?? list.length)
    } catch {
      toast.error('Failed to load invoices')
      setInvoices([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [offset])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDownload = useCallback(
    (inv: PaymentInvoice) => {
      const url = inv.pdf_url ?? inv.hosted_invoice_url
      if (url) {
        window.open(url, '_blank')
      } else {
        toast.info('PDF not available for this invoice')
      }
    },
    []
  )

  const safeInvoices = Array.isArray(invoices) ? invoices : []
  const hasMore = totalCount > offset + safeInvoices.length
  const hasPrev = offset > 0

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
        <div>
          <Link
            to="/dashboard/payments"
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Payments
          </Link>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Invoices
          </h1>
          <p className="mt-1 text-muted-foreground">
            View and download your billing history
          </p>
        </div>
      </header>

      <Card className="overflow-hidden border-2 border-border/60 transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6 text-primary" />
            Billing history
          </CardTitle>
          <CardDescription>
            All invoices for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : safeInvoices.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
              <p className="mt-4 font-medium text-foreground">
                No invoices yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Invoices will appear here after you subscribe
              </p>
              <Link to="/dashboard/payments">
                <Button variant="accent" className="mt-6 rounded-full">
                  View plans
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                      >
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {inv.created_at
                            ? new Date(inv.created_at).toLocaleDateString()
                            : '—'}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          ${Number(inv.amount_due)} {inv.currency}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              inv.status === 'paid'
                                ? 'default'
                                : inv.status === 'open'
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className="rounded-full"
                          >
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full gap-1"
                            onClick={() => handleDownload(inv)}
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {offset + 1}–{offset + safeInvoices.length} of {totalCount}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={!hasPrev || isLoading}
                    onClick={() => setOffset((o) => Math.max(0, o - limit))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={!hasMore || isLoading}
                    onClick={() => setOffset((o) => o + limit)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
