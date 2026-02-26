/**
 * HelpLink - Simple link to Help/Support center.
 */

import { Link } from 'react-router-dom'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface HelpLinkProps {
  className?: string
}

export function HelpLink({ className }: HelpLinkProps) {
  return (
    <Link
      to="/about-help"
      className={cn(
        'inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg px-2 py-1 -m-1',
        className
      )}
      aria-label="Go to Help and Support"
    >
      <HelpCircle className="h-4 w-4" aria-hidden />
      Help & Support
    </Link>
  )
}
