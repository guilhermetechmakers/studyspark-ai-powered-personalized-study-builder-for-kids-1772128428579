import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface TermsConsentProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  error?: string
  disabled?: boolean
  isLoading?: boolean
  className?: string
  id?: string
}

export function TermsConsent({
  checked,
  onCheckedChange,
  error,
  disabled = false,
  isLoading = false,
  className,
  id = 'terms-consent',
}: TermsConsentProps) {
  const isDisabled = disabled || isLoading

  return (
    <fieldset
      className={cn('space-y-2 border-0 p-0 m-0 min-w-0', className)}
      disabled={isDisabled}
      aria-busy={isLoading}
      aria-describedby={error ? `${id}-error` : undefined}
    >
      <legend className="sr-only">Terms and consent</legend>
      <h2 className="sr-only">Terms and consent</h2>
      <div className="flex items-start gap-3 min-h-[44px] py-1">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          disabled={isDisabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 shrink-0"
        />
        <Label
          htmlFor={id}
          className="text-sm font-normal leading-relaxed cursor-pointer text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
        >
          I accept the{' '}
          <Link
            to="/terms-of-service"
            className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded transition-colors duration-200"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            to="/privacy"
            className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded transition-colors duration-200"
          >
            Privacy Policy
          </Link>
        </Label>
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="flex items-center gap-2 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle
            className="h-4 w-4 shrink-0"
            aria-hidden
          />
          <span>{error}</span>
        </p>
      )}
    </fieldset>
  )
}
