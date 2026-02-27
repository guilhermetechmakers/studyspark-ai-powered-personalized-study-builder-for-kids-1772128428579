/**
 * Onboarding Accept Terms page - Presents ToS and requires acceptance.
 * Used during sign-up flow; gates progression until user accepts.
 * Uses shadcn/ui components with loading states, toast feedback, and full accessibility.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Sparkles, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SkipLink } from '@/components/privacy-policy'
import {
  TableOfContents,
  ToSContentRenderer,
  VersionBadge,
  AcceptConsentCard,
} from '@/components/terms-of-service'
import { TOS_CONTENT } from '@/data/terms-of-service-content'
import type { ToSSection } from '@/types/terms-of-service'

const LOCALE = 'en-US'

export function OnboardingAcceptTermsPage() {
  const navigate = useNavigate()
  const [isAccepting, setIsAccepting] = useState(false)

  const content = TOS_CONTENT ?? { version: '1.0', effectiveDate: '', sections: [] }
  const sections = Array.isArray(content?.sections) ? content.sections : []
  const version = content?.version ?? '1.0'
  const effectiveDate = content?.effectiveDate ?? ''

  const tocItems = sections
    .filter((s): s is ToSSection => s != null && typeof s === 'object' && !!s.id)
    .map((s) => ({ id: s.id, title: s.title ?? 'Untitled' }))

  const handleAccept = async () => {
    const toastId = toast.loading('Accepting terms...', {
      description: 'Please wait while we complete your registration.',
    })
    setIsAccepting(true)
    try {
      // TODO: Replace with actual API when backend is ready
      // await apiPost(`/api/users/:id/accept-tos`, { version: content.version })
      localStorage.setItem(
        'tos_accepted',
        JSON.stringify({
          version: content.version,
          acceptedAt: new Date().toISOString(),
        })
      )
      toast.success('Terms accepted. Welcome to StudySpark!', {
        id: toastId,
        description: 'You can now access your dashboard.',
      })
      navigate('/dashboard', { replace: true })
    } catch {
      toast.error('Something went wrong. Please try again.', {
        id: toastId,
        description: 'Your terms acceptance could not be completed.',
      })
    } finally {
      setIsAccepting(false)
    }
  }

  const handleDecline = () => {
    toast.info('You must accept the Terms of Service to continue.')
    navigate('/login', { replace: true })
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SkipLink href="#main-content">Skip to main content</SkipLink>

      <header
        className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 print:hidden"
        role="banner"
      >
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:rounded-xl"
            aria-label="StudySpark home"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(var(--lavender))] to-[rgb(var(--violet))] text-white"
              aria-hidden
            >
              <Sparkles className="h-5 w-5" aria-hidden />
            </div>
            <span className="text-xl font-bold text-foreground">StudySpark</span>
          </Link>
          <nav aria-label="Breadcrumb">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:rounded-lg"
              aria-label="Back to home"
            >
              ← Back to home
            </Link>
          </nav>
        </div>
      </header>

      <main
        id="main-content"
        className="flex-1 container py-8 md:py-12 print:py-4 px-4 sm:px-6"
        role="main"
      >
        <div className="mx-auto max-w-6xl">
          {/* Page title and version - gradient header per design system */}
          <Card
            className="mb-8 md:mb-10 overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-[rgb(var(--peach-light))] via-[rgb(var(--peach))]/80 to-[rgb(var(--lavender))]/30 shadow-card"
            aria-labelledby="tos-title"
          >
            <CardHeader className="p-8 md:p-12">
              <CardTitle
                id="tos-title"
                className="text-3xl font-bold text-foreground md:text-4xl"
              >
                Terms of Service
              </CardTitle>
              <CardDescription className="mt-2 text-base leading-relaxed text-foreground/90 md:text-lg">
                Please read these terms carefully before using StudySpark. By
                accessing or using our platform, you agree to be bound by these
                Terms.
              </CardDescription>
              <div className="mt-4">
                <VersionBadge
                  version={version}
                  effectiveDate={effectiveDate}
                  locale={LOCALE}
                  className="rounded-full bg-white/60 px-3 py-1.5 text-xs font-medium text-foreground/90 border border-[rgb(var(--peach))]/30"
                />
              </div>
            </CardHeader>
          </Card>

          {/* Two-column layout: TOC (left) + content (right) on desktop */}
          <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
            <aside className="lg:order-1" aria-label="Page navigation">
              <TableOfContents items={tocItems} />
            </aside>

            <div className="lg:order-2 min-w-0 space-y-8">
              <article aria-label="Terms of Service content">
                <ToSContentRenderer sections={sections} />
              </article>

              <Card
                className="mt-8 overflow-hidden rounded-3xl border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--peach-light))]/50 to-[rgb(var(--lavender))]/30 p-8 md:p-10 print:hidden"
                aria-label="Download options"
              >
                <CardHeader className="p-0">
                  <CardTitle className="text-xl md:text-2xl">
                    Download for Your Records
                  </CardTitle>
                  <CardDescription className="text-center text-base text-foreground/90">
                    Save a copy of these terms for your records. Use the print
                    dialog and select &quot;Save as PDF&quot; or &quot;Print to
                    PDF&quot;.
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-6 p-0">
                  <Button
                    type="button"
                    variant="default"
                    size="lg"
                    onClick={handlePrint}
                    className="rounded-full"
                    aria-label="Print or save as PDF"
                  >
                    <FileDown className="h-5 w-5" aria-hidden />
                    Print / Save as PDF
                  </Button>
                </CardContent>
              </Card>

              <div className="mt-8">
                <AcceptConsentCard
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  requireScrollToBottom
                  isLoading={isAccepting}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer
        className="mt-auto border-t border-border bg-card py-6 print:hidden"
        role="contentinfo"
      >
        <div className="container flex flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between sm:px-6">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            aria-label="StudySpark home"
          >
            StudySpark
          </Link>
          <div className="flex gap-6">
            <Link
              to="/terms-of-service"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:rounded"
              aria-label="View full Terms of Service"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy-policy"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:rounded"
              aria-label="View Privacy Policy"
            >
              Privacy Policy
            </Link>
            <Link
              to="/cookie-policy"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:rounded"
              aria-label="View Cookie Policy"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
