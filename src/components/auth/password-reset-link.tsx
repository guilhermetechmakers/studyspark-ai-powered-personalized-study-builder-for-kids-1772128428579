import { Link } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface PasswordResetLinkProps {
  className?: string
}

export function PasswordResetLink({ className }: PasswordResetLinkProps) {
  return (
    <Button
      asChild
      variant="link"
      size="sm"
      className={cn(
        'h-auto py-2 px-3 text-sm font-medium gap-2 rounded-lg',
        'text-primary underline-offset-4 hover:underline',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'transition-all duration-200',
        className
      )}
    >
      <Link
        to="/forgot-password"
        aria-label="Forgot password? Request a password reset link"
      >
        <KeyRound className="h-4 w-4 shrink-0" aria-hidden />
        Forgot password?
      </Link>
    </Button>
  )
}
