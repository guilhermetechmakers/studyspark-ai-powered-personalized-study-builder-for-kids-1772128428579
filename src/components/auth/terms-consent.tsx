import { Link } from 'react-router-dom'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface TermsConsentProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  error?: string
  disabled?: boolean
  className?: string
  id?: string
}

export function TermsConsent({
  checked,
  onCheckedChange,
  error,
  disabled = false,
  className,
  id = 'terms-consent',
}: TermsConsentProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5"
        />
        <Label
          htmlFor={id}
          className="text-sm font-normal leading-relaxed cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I accept the{' '}
          <Link
            to="/terms"
            className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            to="/privacy"
            className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Privacy Policy
          </Link>
        </Label>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
