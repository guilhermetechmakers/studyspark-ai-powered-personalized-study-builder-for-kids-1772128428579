import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ResendVerificationButtonProps {
  cooldown: number
  onResend: () => void
  isLoading?: boolean
}

export function ResendVerificationButton({
  cooldown,
  onResend,
  isLoading = false,
}: ResendVerificationButtonProps) {
  const isDisabled = cooldown > 0 || isLoading

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className={cn(
        'w-full rounded-full border-2 transition-all duration-200',
        'hover:border-primary/50 hover:bg-primary/5',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-70'
      )}
      onClick={onResend}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-label={
        cooldown > 0
          ? `Resend verification email in ${cooldown} seconds`
          : 'Resend verification email'
      }
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Sending...
        </span>
      ) : cooldown > 0 ? (
        <span className="flex items-center gap-2">
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary/50 text-sm font-semibold text-primary"
            aria-hidden
          >
            {cooldown}
          </span>
          Resend in {cooldown}s
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Send className="h-4 w-4" aria-hidden />
          Resend verification email
        </span>
      )}
    </Button>
  )
}
