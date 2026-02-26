import { AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

export interface TokenStatusBannerProps {
  isValid: boolean
  expiresIn?: string
  className?: string
}

export function TokenStatusBanner({ isValid, expiresIn, className }: TokenStatusBannerProps) {
  if (isValid) {
    return (
      <div
        role="status"
        className={cn(
          'flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/50',
          className
        )}
      >
        <Clock className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            Reset link is valid
          </p>
          <p className="text-sm text-green-700 dark:text-green-300">
            {expiresIn ?? 'Reset links expire in 1 hour. Set your new password below.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 dark:bg-destructive/20',
        className
      )}
    >
      <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
      <div className="space-y-2">
        <p className="text-sm font-medium text-destructive">
          This reset link is invalid or has expired
        </p>
        <p className="text-sm text-muted-foreground">
          Password reset links expire after 1 hour and can only be used once. Please request a new
          link to try again.
        </p>
        <Link
          to="/password-reset"
          className="inline-block text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          Request a new reset link
        </Link>
      </div>
    </div>
  )
}
