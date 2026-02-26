import { useState } from 'react'
import { Tag, Loader2, Check, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface PromoCodeInputProps {
  value: string
  onChange: (value: string) => void
  onApply: (code: string) => void
  isValidating?: boolean
  isValid?: boolean
  message?: string
  discountLabel?: string
  disabled?: boolean
  className?: string
}

const PROMO_FORMAT = /^[a-zA-Z0-9_-]{3,20}$/

export function PromoCodeInput({
  value,
  onChange,
  onApply,
  isValidating = false,
  isValid,
  message,
  discountLabel,
  disabled = false,
  className,
}: PromoCodeInputProps) {
  const [touched, setTouched] = useState(false)
  const trimmed = (value ?? '').trim()
  const formatValid = trimmed.length === 0 || PROMO_FORMAT.test(trimmed)
  const canApply = trimmed.length >= 3 && formatValid && !isValidating

  const handleApply = () => {
    if (!canApply) return
    setTouched(true)
    onApply(trimmed)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor="promo-code" className="text-sm font-medium">
        Promo code
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="promo-code"
            type="text"
            placeholder="Enter code"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setTouched(true)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApply())}
            disabled={disabled}
            className={cn(
              'rounded-xl pl-10 pr-10',
              isValid === true && 'border-green-500 focus-visible:ring-green-500',
              isValid === false && touched && 'border-destructive focus-visible:ring-destructive'
            )}
            aria-invalid={isValid === false && touched}
            aria-describedby="promo-message"
          />
          {isValidating && (
            <Loader2
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
              aria-hidden
            />
          )}
          {!isValidating && isValid === true && (
            <Check
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-600"
              aria-hidden
            />
          )}
          {!isValidating && isValid === false && touched && trimmed.length > 0 && (
            <X
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive"
              aria-hidden
            />
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleApply}
          disabled={!canApply || disabled}
          className="rounded-xl shrink-0"
        >
          Apply
        </Button>
      </div>
      <div id="promo-message" aria-live="polite" className="min-h-[1.25rem]">
        {message && (
          <p
            className={cn(
              'text-sm',
              isValid ? 'text-green-600' : 'text-destructive'
            )}
          >
            {message}
          </p>
        )}
        {discountLabel && isValid && (
          <p className="text-sm font-medium text-green-600">{discountLabel}</p>
        )}
        {!formatValid && trimmed.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Code must be 3–20 characters, letters and numbers only
          </p>
        )}
      </div>
    </div>
  )
}
