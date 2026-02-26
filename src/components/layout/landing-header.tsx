import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthContextOptional } from '@/contexts/auth-context'

export function LandingHeader() {
  const auth = useAuthContextOptional()
  const isAuthenticated = auth?.isAuthenticated ?? false

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(var(--lavender))] to-[rgb(var(--violet))] text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-foreground">StudySpark</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/#features"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </Link>
          <Link
            to="/#how-it-works"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            How It Works
          </Link>
          <Link
            to="/#pricing"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            to="/#faq"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            FAQ
          </Link>
          <Link
            to="/about-help"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Help
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="default" asChild>
                <Link to="/dashboard/settings">Settings</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button variant="default" asChild>
                <Link to="/signup">Sign Up Free</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
