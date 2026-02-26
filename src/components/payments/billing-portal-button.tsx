/**
 * BillingPortalButton - Opens Stripe Billing Portal or in-app portal
 * StudySpark design: pill-shaped, gradient accent
 */

import { ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface BillingPortalButtonProps {
  onClick: () => void | Promise<void>
  isLoading?: boolean
  disabled?: boolean
  variant?: 'default' | 'outline' | 'accent'
  size?: 'default' | 'sm' | 'lg'
  children?: React.ReactNode
  className?: string
}

export function BillingPortalButton({
  onClick,
  isLoading = false,
  disabled = false,
  variant = 'accent',
  size = 'default',
  children = 'Manage Billing',
  className,
}: BillingPortalButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn('rounded-full', className)}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label="Open billing portal"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <ExternalLink className="h-4 w-4" aria-hidden />
      )}
      {children}
    </Button>
  )
}
