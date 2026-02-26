/**
 * CouponInput - Validate and apply coupon in checkout flow
 * StudySpark design: rounded inputs, inline validation
 */

import { Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface CouponInputProps {
  value: string
  onChange: (value: string) => void
  onApply: (code: string) => void | Promise<void>
  isValidating?: boolean
  isValid?: boolean
  message?: string
  discountLabel?: string
  disabled?: boolean
  className?: string
}

export function CouponInput({
  value,
  onChange,
  onApply,
  isValidating = false,
  isValid = false,
  message,
  discountLabel,
  disabled = false,
  className,
}: CouponInputProps) {
  const handleApply = () => {
    const code = (value ?? '').toString().trim()
    if (code) onApply(code)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Coupon code"
            className="rounded-full pl-9"
            disabled={disabled || isValidating}
            aria-label="Coupon code"
            aria-invalid={message ? true : undefined}
            aria-describedby={message ? 'coupon-message' : undefined}
          />
        </div>
        <Button
          variant="outline"
          size="default"
          className="rounded-full shrink-0"
          onClick={handleApply}
          disabled={disabled || isValidating || !(value ?? '').trim()}
        >
          {isValidating ? 'Checking...' : 'Apply'}
        </Button>
      </div>
      {message && (
        <p
          id="coupon-message"
          className={cn(
            'text-sm',
            isValid ? 'text-success-foreground' : 'text-destructive'
          )}
        >
          {message}
        </p>
      )}
      {discountLabel && isValid && (
        <p className="text-sm font-medium text-primary">{discountLabel}</p>
      )}
    </div>
  )
}
