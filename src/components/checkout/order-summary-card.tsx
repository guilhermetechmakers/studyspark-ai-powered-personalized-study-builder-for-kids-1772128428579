import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import type { ExportItem } from '@/types/checkout'

export interface OrderSummaryCardProps {
  items: ExportItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  currency?: string
  promoCode?: string
  className?: string
  /** Optional href for empty state CTA. Defaults to /dashboard/studies */
  emptyStateCtaHref?: string
  /** Optional label for empty state CTA. Defaults to "Browse studies" */
  emptyStateCtaLabel?: string
}

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function OrderSummaryCard({
  items = [],
  subtotal,
  discount,
  tax,
  total,
  currency = 'USD',
  promoCode,
  className,
  emptyStateCtaHref = '/dashboard/studies',
  emptyStateCtaLabel = 'Browse studies',
}: OrderSummaryCardProps) {
  const [expanded, setExpanded] = useState(true)
  const safeItems = Array.isArray(items) ? items : []

  return (
    <Card
      className={cn(
        'overflow-hidden rounded-xl bg-gradient-to-br from-card to-muted/60 shadow-card',
        className
      )}
    >
      <CardHeader className="pb-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between text-left"
          aria-expanded={expanded}
          aria-controls="order-summary-content"
        >
          <h3 className="text-lg font-bold text-foreground">Order Summary</h3>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      </CardHeader>
      <CardContent id="order-summary-content" className="pt-0">
        {expanded && (
          <div className="space-y-4 animate-fade-in">
            {safeItems.length > 0 ? (
              <Accordion type="single" collapsible defaultValue="items">
                <AccordionItem value="items" className="border-0">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <span className="text-sm font-medium">
                      {safeItems.length} item{safeItems.length !== 1 ? 's' : ''}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {safeItems.map((item) => {
                        const qty = item.quantity ?? 1
                        const lineTotal = (item.price ?? 0) * qty
                        return (
                          <li
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {item.name} × {qty}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(lineTotal, item.currency ?? currency)}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <div
                className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-8 text-center"
                role="status"
                aria-label="Order summary empty"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <ShoppingBag className="h-6 w-6 text-muted-foreground" aria-hidden />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    No items in your cart
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Add study sets from your library to get started
                  </p>
                </div>
                <Button asChild variant="default" size="default" className="rounded-full">
                  <Link to={emptyStateCtaHref}>
                    <ShoppingBag className="h-4 w-4" aria-hidden />
                    {emptyStateCtaLabel}
                  </Link>
                </Button>
              </div>
            )}

            <div className="space-y-2 border-t border-border pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-success-foreground">
                  <span>
                    Discount{promoCode ? ` (${promoCode})` : ''}
                  </span>
                  <span>-{formatCurrency(discount, currency)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(tax, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-2">
                <span>Total</span>
                <span className="text-primary">
                  {formatCurrency(total, currency)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
