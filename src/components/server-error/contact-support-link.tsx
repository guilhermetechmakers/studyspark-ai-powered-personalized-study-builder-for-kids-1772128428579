/**
 * ContactSupportLink - Link or button that navigates to the Help/Support page.
 */

import { Link } from 'react-router-dom'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ContactSupportLinkProps {
  className?: string
  variant?: 'link' | 'button'
}

export function ContactSupportLink({ className, variant = 'link' }: ContactSupportLinkProps) {
  const baseClass = cn(
    'inline-flex items-center gap-2 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg transition-all duration-200',
    variant === 'link' &&
      'text-primary hover:underline px-2 py-1 -m-1 hover:bg-primary/5',
    variant === 'button' &&
      'rounded-full border-2 border-primary bg-transparent text-primary hover:bg-primary/10 px-6 py-2.5 hover:scale-[1.02] active:scale-[0.98]',
    className
  )

  return (
    <Link
      to="/about-help#support"
      className={baseClass}
      aria-label="Contact support and get help"
    >
      <HelpCircle className="h-4 w-4 shrink-0" aria-hidden />
      Contact Support
    </Link>
  )
}
