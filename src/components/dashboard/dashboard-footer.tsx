import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

const footerLinks = [
  { label: 'Help', href: '/help' },
  { label: 'About', href: '/about' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms-of-service' },
  { label: 'Cookies', href: '/cookie-policy' },
]

export function DashboardFooter() {
  return (
    <footer
      className="mt-auto border-t border-border bg-card/50 px-6 py-4"
      role="contentinfo"
    >
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <Sparkles className="h-4 w-4" />
          <span>StudySpark</span>
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-4" aria-label="Footer navigation">
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
