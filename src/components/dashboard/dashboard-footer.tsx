import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const footerLinks = [
  { label: 'Help', href: '/help' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
]

export interface DashboardFooterProps {
  className?: string
}

export function DashboardFooter({ className }: DashboardFooterProps) {
  return (
    <footer
      className={cn(
        'mt-auto border-t border-border bg-card/50 py-6',
        className
      )}
      role="contentinfo"
    >
      <div className="flex flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} StudySpark. All rights reserved.
        </p>
        <nav className="flex items-center gap-6" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
