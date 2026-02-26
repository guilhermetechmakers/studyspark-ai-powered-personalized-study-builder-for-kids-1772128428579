import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
}: OrderSummaryCardProps) {
  const [expanded, setExpanded] = useState(true)
  const safeItems = Array.isArray(items) ? items : []

  return (
    <Card
      className={cn(
        'overflow-hidden bg-gradient-to-br from-[rgb(var(--peach-light))]/30 to-[rgb(var(--lavender))]/10',
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
              <p className="text-sm text-muted-foreground">
                No items selected
              </p>
            )}

            <div className="space-y-2 border-t border-border pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
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
