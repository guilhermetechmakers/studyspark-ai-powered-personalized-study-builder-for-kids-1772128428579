import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import {
  SkipLink,
  PolicyHeader,
  DataTypesSection,
  DataUsageSection,
  DataRetentionSection,
  ParentalConsentSection,
  RightsSection,
  ConsentSummaryCard,
  ContactInfoSection,
  DownloadPolicyButton,
} from '@/components/privacy-policy'

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
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
        <div className="mx-auto max-w-3xl space-y-8 md:space-y-10">
          <PolicyHeader />

          <nav
            className="rounded-2xl border border-border/60 bg-muted/50 p-4 print:hidden"
            aria-label="Policy sections"
          >
            <p className="mb-2 text-sm font-medium text-foreground">
              On this page
            </p>
            <ul className="flex flex-wrap gap-2 text-sm">
              {[
                { label: 'Data We Collect', href: '#data-we-collect' },
                { label: 'How We Use Data', href: '#how-we-use-your-data' },
                { label: 'Retention', href: '#data-retention-deletion' },
                { label: 'Parental Consent', href: '#parental-consent-for-childrens-data' },
                { label: 'Your Rights', href: '#your-rights-choices' },
                { label: 'Parental Summary', href: '#consent-summary-title' },
                { label: 'Contact', href: '#contact-us' },
              ].map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="rounded-full bg-background px-3 py-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="data-we-collect-heading">
            <DataTypesSection />
          </section>

          <section aria-labelledby="how-we-use-your-data-heading">
            <DataUsageSection />
          </section>

          <section aria-labelledby="data-retention-deletion-heading">
            <DataRetentionSection />
          </section>

          <section aria-labelledby="parental-consent-for-childrens-data-heading">
            <ParentalConsentSection />
          </section>

          <section aria-labelledby="your-rights-choices-heading">
            <RightsSection />
          </section>

          <section aria-labelledby="consent-summary-title">
            <ConsentSummaryCard />
          </section>

          <div className="flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-br from-[rgb(var(--peach-light))]/50 to-[rgb(var(--lavender))]/30 p-8 md:p-10 print:hidden">
            <h2 className="text-xl font-bold text-foreground md:text-2xl">
              Download for Your Records
            </h2>
            <p className="text-center text-base text-foreground/90">
              Save a copy of this policy for your records. Use the print dialog and select &quot;Save as PDF&quot; or &quot;Print to PDF&quot;.
            </p>
            <DownloadPolicyButton />
          </div>

          <section aria-labelledby="contact-us-heading">
            <ContactInfoSection />
          </section>
        </div>
      </main>

      <footer
        className="mt-auto border-t border-border bg-card py-6 print:hidden"
        role="contentinfo"
      >
        <div className="container flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
              to="/cookies"
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
