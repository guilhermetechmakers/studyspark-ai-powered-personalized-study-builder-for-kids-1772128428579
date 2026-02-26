/**
 * CookiePolicyPage - Self-contained Cookie Policy page with consent management.
 * Explains cookie usage, provides category toggles, and persists preferences to localStorage.
 */
import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Shield, BarChart3, Megaphone } from 'lucide-react'
import { toast } from 'sonner'
import {
  SkipLink,
} from '@/components/privacy-policy'
import {
  CookiePolicyHeader,
  CategoryToggle,
  PolicyTextBlock,
  ConsentActions,
} from '@/components/cookie-policy'
import { useCookieConsentState } from '@/hooks/use-cookie-consent-state'
import { cn } from '@/lib/utils'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  essential: <Shield className="h-5 w-5" aria-hidden />,
  analytics: <BarChart3 className="h-5 w-5" aria-hidden />,
  advertising: <Megaphone className="h-5 w-5" aria-hidden />,
}

export function CookiePolicyPage() {
  const { categories, updateCategory, saveConsent, revokeConsent } =
    useCookieConsentState()
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  const handleSave = useCallback(() => {
    setSaving(true)
    setSavedMessage(null)
    saveConsent()
    setSaving(false)
    setSavedMessage('Preferences saved successfully.')
    toast.success('Cookie preferences saved')
    setTimeout(() => setSavedMessage(null), 4000)
  }, [saveConsent])

  const handleRevoke = useCallback(() => {
    setSaving(true)
    setSavedMessage(null)
    revokeConsent()
    setSaving(false)
    setSavedMessage('Consent revoked. All optional cookies disabled.')
    toast.info('Cookie consent revoked')
    setTimeout(() => setSavedMessage(null), 4000)
  }, [revokeConsent])

  const safeCategories = Array.isArray(categories) ? categories : []

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
        <div className="mx-auto max-w-3xl space-y-8 md:space-y-10 animate-stagger">
          <CookiePolicyHeader />

          <section aria-labelledby="what-are-cookies-heading">
            <PolicyTextBlock id="what-are-cookies" title="What are cookies?">
              <p>
                Cookies are small text files stored on your device when you visit
                a website. They help the site remember your preferences, keep you
                signed in, and understand how the site is used so we can improve
                it.
              </p>
              <p>
                StudySpark uses cookies to provide a safe, personalized learning
                experience for your child. You can choose which types of cookies
                to allow below.
              </p>
            </PolicyTextBlock>
          </section>

          <section aria-labelledby="cookie-categories-heading">
            <h2
              id="cookie-categories-heading"
              className="text-xl font-bold text-foreground md:text-2xl mb-4"
            >
              Cookie categories
            </h2>
            <div className="space-y-4">
              {safeCategories.map((cat) => (
                <CategoryToggle
                  key={cat.id}
                  id={cat.id}
                  label={cat.label}
                  description={cat.description}
                  value={cat.enabled}
                  onChange={updateCategory}
                  disabled={cat.required === true}
                  icon={CATEGORY_ICONS[cat.id]}
                />
              ))}
            </div>
          </section>

          <ConsentActions
            onSave={handleSave}
            onRevoke={handleRevoke}
            saving={saving}
            savedMessage={savedMessage}
          />

          <section aria-labelledby="retention-heading">
            <PolicyTextBlock
              id="retention"
              title="Data retention and deletion"
            >
              <p>
                Cookie data is stored according to each category. Essential
                cookies are typically session-based or short-lived. Analytics and
                advertising cookies may persist for up to 24 months unless you
                revoke consent, at which point we stop using them and delete
                stored data as soon as practicable.
              </p>
              <p>
                You can revoke consent at any time using the &quot;Revoke
                Consent&quot; button above. This will reset all optional cookies
                to off.
              </p>
            </PolicyTextBlock>
          </section>

          <section aria-labelledby="revoke-heading">
            <PolicyTextBlock
              id="revoke"
              title="How to revoke or change consent"
            >
              <p>
                Return to this page anytime to update your cookie preferences.
                Click &quot;Save Preferences&quot; after making changes. To reset
                everything to defaults (only essential cookies on), click
                &quot;Revoke Consent&quot;.
              </p>
              <p>
                You can also manage cookies through your browser settings. Note
                that disabling essential cookies may affect core functionality
                such as signing in.
              </p>
            </PolicyTextBlock>
          </section>

          <div className="flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-br from-[rgb(var(--peach-light))]/50 to-[rgb(var(--lavender))]/30 p-8 md:p-10 print:hidden transition-shadow duration-300 hover:shadow-card-hover">
            <h2 className="text-xl font-bold text-foreground md:text-2xl">
              Need more information?
            </h2>
            <p className="text-center text-base text-foreground/90">
              For our full privacy practices, including how we handle children&apos;s
              data, see our Privacy Policy.
            </p>
            <Link
              to="/privacy-policy"
              className={cn(
                'inline-flex items-center justify-center rounded-full',
                'h-12 px-8 text-base font-medium',
                'bg-primary text-primary-foreground shadow-md',
                'hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]',
                'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
              )}
            >
              View Privacy Policy
            </Link>
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
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            StudySpark
          </Link>
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <Link
              to="/cookie-policy"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:rounded"
            >
              Cookie Policy
            </Link>
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
          </div>
        </div>
      </footer>
    </div>
  )
}
