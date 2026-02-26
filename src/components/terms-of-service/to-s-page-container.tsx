/**
 * ToSPageContainer - Layout wrapper with header, TOC, and content area.
 * Responsive: two-column (TOC + content) on desktop, single-column on mobile.
 */
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { SkipLink } from '@/components/privacy-policy'
import { TableOfContents } from './table-of-contents'
import { ToSContentRenderer } from './to-s-content-renderer'
import { VersionBadge } from './version-badge'
import { AcceptConsentCard } from './accept-consent-card'
import type { ToSContent, ToSSection } from '@/types/terms-of-service'
import { cn } from '@/lib/utils'

export interface ToSPageContainerProps {
  content: ToSContent
  locale?: string
  onAccept?: () => void | Promise<void>
  onDecline?: () => void
  showAcceptCard?: boolean
  requireScrollToBottom?: boolean
  className?: string
}

export function ToSPageContainer({
  content,
  locale = 'en-US',
  onAccept,
  onDecline,
  showAcceptCard = false,
  requireScrollToBottom = false,
  className,
}: ToSPageContainerProps) {
  const sections = Array.isArray(content?.sections) ? content.sections : []
  const version = content?.version ?? '1.0'
  const effectiveDate = content?.effectiveDate ?? ''

  const tocItems = sections
    .filter((s): s is ToSSection => s != null && typeof s === 'object' && !!s.id)
    .map((s) => ({ id: s.id, title: s.title ?? 'Untitled' }))

  return (
    <div className={cn('min-h-screen flex flex-col bg-background', className)}>
      <SkipLink href="#main-content">Skip to main content</SkipLink>

      <header
        className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 print:hidden"
        role="banner"
      >
        <div className="container flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:rounded-xl"
            aria-label="StudySpark home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(var(--lavender))] to-[rgb(var(--violet))] text-white">
              <Sparkles className="h-5 w-5" aria-hidden />
            </div>
            <span className="text-xl font-bold text-foreground">StudySpark</span>
          </Link>
          <nav aria-label="Breadcrumb">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:rounded-lg"
            >
              ← Back to home
            </Link>
          </nav>
        </div>
      </header>

      <main
        id="main-content"
        className="flex-1 container py-8 md:py-12 print:py-4"
        role="main"
      >
        <div className="mx-auto max-w-6xl">
          {/* Page title and version - gradient header per design system */}
          <header
            className="mb-8 md:mb-10 rounded-3xl bg-gradient-to-br from-[rgb(var(--peach-light))] via-[rgb(var(--peach))]/80 to-[rgb(var(--lavender))]/30 p-8 md:p-12"
            aria-labelledby="tos-title"
          >
            <h1
              id="tos-title"
              className="text-3xl font-bold text-foreground md:text-4xl"
            >
              Terms of Service
            </h1>
            <p className="mt-2 text-base leading-relaxed text-foreground/90 md:text-lg">
              Please read these terms carefully before using StudySpark. By accessing or using our platform, you agree to be bound by these Terms.
            </p>
            <div className="mt-4">
              <VersionBadge
                version={version}
                effectiveDate={effectiveDate}
                locale={locale}
                className="rounded-full bg-white/60 px-3 py-1.5 text-xs font-medium text-foreground/90 border border-[rgb(var(--peach))]/30"
              />
            </div>
          </header>

          {/* Two-column layout: TOC (left) + content (right) on desktop */}
          <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
            <aside className="lg:order-1" aria-label="Page navigation">
              <TableOfContents items={tocItems} />
            </aside>

            <div className="lg:order-2 min-w-0 space-y-8">
              <article aria-label="Terms of Service content">
                <ToSContentRenderer sections={sections} />
              </article>

              <div
                className="mt-8 flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-br from-[rgb(var(--peach-light))]/50 to-[rgb(var(--lavender))]/30 p-8 md:p-10 print:hidden"
                aria-label="Download options"
              >
                <h2 className="text-xl font-bold text-foreground md:text-2xl">
                  Download for Your Records
                </h2>
                <p className="text-center text-base text-foreground/90">
                  Save a copy of these terms for your records. Use the print dialog and select &quot;Save as PDF&quot; or &quot;Print to PDF&quot;.
                </p>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-md transition-all hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="Print or save as PDF"
                >
                  Print / Save as PDF
                </button>
              </div>

              {showAcceptCard && onAccept && (
                <div className="mt-8">
                  <AcceptConsentCard
                    onAccept={onAccept}
                    onDecline={onDecline}
                    requireScrollToBottom={requireScrollToBottom}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer
        className="mt-auto border-t border-border bg-card py-6 print:hidden"
        role="contentinfo"
      >
        <div className="container flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            StudySpark
          </Link>
          <div className="flex gap-6">
            <Link
              to="/terms-of-service"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:rounded"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy-policy"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:rounded"
            >
              Privacy Policy
            </Link>
            <Link
              to="/cookie-policy"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:rounded"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
