import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface PasswordResetLinkProps {
  className?: string
}

export function PasswordResetLink({ className }: PasswordResetLinkProps) {
  return (
    <Link
      to="/forgot-password"
      className={cn(
        'text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1',
        className
      )}
    >
      Forgot password?
    </Link>
  )
}
