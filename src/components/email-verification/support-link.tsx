import { Link } from 'react-router-dom'
import { HelpCircle } from 'lucide-react'

export function SupportLink() {
  return (
    <p className="text-center text-sm text-muted-foreground">
      Didn&apos;t receive the email? Check your spam folder or{' '}
      <Link
        to="/help"
        className="inline-flex items-center gap-1 text-primary font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        aria-label="Get help with email verification"
      >
        <HelpCircle className="h-4 w-4" aria-hidden />
        contact support
      </Link>
    </p>
  )
}
