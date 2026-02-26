import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Shield, BarChart3, Megaphone } from 'lucide-react'
import { toast } from 'sonner'
import { useCookieConsentState } from '@/hooks/use-cookie-consent-state'
import {
  PolicyTextBlock,
  CategoryToggle,
  ConsentActions,
} from '@/components/cookie-policy'
import type { CookieCategory } from '@/types/cookie-policy'

const CATEGORY_ICONS: Record<string, typeof Shield> = {
  essential: Shield,
  analytics: BarChart3,
  advertising: Megaphone,
}

export function CookiePolicyPage() {
  const { categories, setCategories, saveConsent, revokeConsent } =
    useCookieConsentState()
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  const handleCategoryChange = useCallback(
    (id: string, value: boolean) => {
      setCategories((prev) => {
        const safe = Array.isArray(prev) ? prev : []
        return safe.map((c) =>
          c.id === id && c.required !== true ? { ...c, enabled: value } : c
        )
      })
    },
    [setCategories]
  )

  const handleSave = useCallback(async () => {
    setSaving(true)
    setSavedMessage(null)
    try {
      saveConsent()
      setSavedMessage('Your cookie preferences have been saved.')
      toast.success('Preferences saved', {
        description: 'Your cookie preferences have been updated.',
      })
    } catch {
      toast.error('Something went wrong', {
        description: 'Could not save your preferences. Please try again.',
      })
    } finally {
      setSaving(false)
    }
  }, [saveConsent])

  const handleRevoke = useCallback(async () => {
    setSaving(true)
    setSavedMessage(null)
    try {
      revokeConsent()
      setSavedMessage('Your consent has been revoked. All optional cookies are now disabled.')
      toast.success('Consent revoked', {
        description: 'Your cookie preferences have been reset to defaults.',
      })
    } catch {
      toast.error('Something went wrong', {
        description: 'Could not revoke consent. Please try again.',
      })
    } finally {
      setSaving(false)
    }
  }, [revokeConsent])

  const safeCategories = Array.isArray(categories) ? categories : []

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header
        className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
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
        className="flex-1 container py-8 md:py-12"
        role="main"
      >
        <div className="mx-auto max-w-3xl space-y-8 md:space-y-10">
          <header
            className="rounded-3xl bg-gradient-to-br from-[rgb(var(--peach-light))] via-[rgb(var(--peach))]/80 to-[rgb(var(--lavender))]/30 p-8 md:p-12 animate-fade-in-up"
            aria-labelledby="cookie-policy-title"
          >
            <div className="space-y-4">
              <h1
                id="cookie-policy-title"
                className="text-3xl font-bold text-foreground md:text-4xl"
              >
                Cookie Policy
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-foreground/90 md:text-lg">
                You have control over your cookie preferences. Use the toggles
                below to choose which types of cookies StudySpark can use.
              </p>
            </div>
          </header>

          <section
            className="space-y-6 animate-fade-in-up"
            style={{ animationDelay: '50ms' }}
            aria-labelledby="what-are-cookies-heading"
          >
            <PolicyTextBlock id="what-are-cookies" heading="What are cookies?">
              <p>
                Cookies are small text files stored on your device when you
                visit a website. They help websites remember your preferences,
                keep you signed in, and understand how you use the service.
                StudySpark uses cookies to provide a safe, personalized
                learning experience for your family.
              </p>
            </PolicyTextBlock>
          </section>

          <section
            className="space-y-6 animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
            aria-labelledby="cookie-categories-heading"
          >
            <h2
              id="cookie-categories-heading"
              className="text-xl font-bold text-foreground md:text-2xl"
            >
              Cookie categories
            </h2>
            <div className="space-y-4">
              {(safeCategories ?? []).map((category: CookieCategory) => {
                const Icon = CATEGORY_ICONS[category.id]
                return (
                  <CategoryToggle
                    key={category.id}
                    id={category.id}
                    label={category.label}
                    description={category.description}
                    value={category.enabled}
                    onChange={handleCategoryChange}
                    disabled={category.required === true}
                    icon={Icon}
                  />
                )
              })}
            </div>
          </section>

          <section
            className="rounded-[20px] border border-border/60 bg-gradient-to-br from-[rgb(var(--peach-light))]/40 via-white to-[rgb(var(--lavender))]/20 p-6 md:p-8 shadow-card transition-all duration-300 hover:shadow-card-hover animate-fade-in-up"
            style={{ animationDelay: '150ms' }}
            aria-labelledby="retention-heading"
          >
            <PolicyTextBlock id="retention" heading="Data retention & deletion">
              <p>
                Cookie data is stored according to each category&apos;s purpose.
                Essential cookies are kept for the duration of your session.
                Analytics and advertising cookies may be retained for up to 24
                months. You can revoke consent at any time to clear stored
                preferences and disable optional cookies.
              </p>
            </PolicyTextBlock>
          </section>

          <section
            className="rounded-[20px] border border-border/60 bg-gradient-to-br from-[rgb(var(--peach-light))]/40 via-white to-[rgb(var(--lavender))]/20 p-6 md:p-8 shadow-card transition-all duration-300 hover:shadow-card-hover animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
            aria-labelledby="revoke-heading"
          >
            <PolicyTextBlock
              id="revoke"
              heading="How to revoke or change consent"
            >
              <p>
                Click &quot;Revoke Consent&quot; below to reset all optional
                cookies to off. Your choices are saved locally on your device.
                You can return to this page anytime to update your preferences.
              </p>
            </PolicyTextBlock>
          </section>

          <section
            className="flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-[rgb(var(--peach-light))]/50 to-[rgb(var(--lavender))]/30 p-8 md:p-10 animate-fade-in-up"
            style={{ animationDelay: '250ms' }}
            aria-label="Cookie preferences actions"
          >
            <h2 className="text-xl font-bold text-foreground md:text-2xl">
              Manage your preferences
            </h2>
            <ConsentActions
              onSave={handleSave}
              onRevoke={handleRevoke}
              saving={saving}
            />
            {savedMessage && (
              <div
                role="status"
                aria-live="polite"
                className="rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary"
              >
                {savedMessage}
              </div>
            )}
          </section>

          <section className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <p className="text-sm text-muted-foreground">
              For more information, see our{' '}
              <Link
                to="/privacy-policy"
                className="font-medium text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:rounded"
              >
                Privacy Policy
              </Link>{' '}
              or{' '}
              <Link
                to="/about-help"
                className="font-medium text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:rounded"
              >
                Help Center
              </Link>
              .
            </p>
          </section>
        </div>
      </main>

      <footer
        className="mt-auto border-t border-border bg-card py-6"
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
