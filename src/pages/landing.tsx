import { useMemo, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LandingHeader } from '@/components/layout/landing-header'
import { LandingFooter } from '@/components/layout/landing-footer'
import {
  HeroSection,
  HeroDashboardPreview,
  FeaturesOverview,
  HowItWorks,
  PricingSnapshot,
  TestimonialsCarousel,
  BuildAPlanWidget,
  AITailorPreview,
  FAQPreview,
} from '@/components/landing'
import {
  mockPricingTiers,
  mockTestimonials,
  mockFAQs,
  getPricingTiers,
  getTestimonials,
  getFAQs,
} from '@/data/landing-mock'

/**
 * LandingPageContainer
 * Fetches static content or uses in-component data structures with safe defaults.
 * Future: Replace mock data with API calls (GET /pricing-tiers, GET /testimonials, GET /faqs).
 */
export function LandingPage() {
  const { hash } = useLocation()

  // Scroll to section when hash is present (e.g. /#how-it-works)
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1)
      const el = document.getElementById(id)
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [hash])

  // Mock data - in production, replace with:
  // const { data } = useQuery({ queryKey: ['pricing'], queryFn: fetchPricingTiers })
  // const tiers = getPricingTiers(data)
  // const displayTiers = (tiers?.length ?? 0) > 0 ? tiers : mockPricingTiers
  const tiers = useMemo(() => getPricingTiers({ tiers: mockPricingTiers }), [])
  const testimonials = useMemo(() => getTestimonials({ testimonials: mockTestimonials }), [])
  const faqs = useMemo(() => getFAQs({ faqs: mockFAQs }), [])

  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection heroIllustration={<HeroDashboardPreview />} />
        <FeaturesOverview />

        {/* Interactive widgets: Build-a-Plan and AI Tailor Preview */}
        <section
          id="interactive-demo"
          className="py-20 md:py-28 bg-muted/30"
          aria-labelledby="interactive-demo-heading"
        >
          <div className="container">
            <h2 id="interactive-demo-heading" className="sr-only">
              Interactive demo
            </h2>
            <div className="mx-auto max-w-2xl text-center mb-12">
              <p className="text-lg text-muted-foreground">
                Try it out—see how StudySpark works
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:max-w-5xl lg:mx-auto">
              <BuildAPlanWidget />
              <AITailorPreview />
            </div>
          </div>
        </section>

        <HowItWorks />
        <PricingSnapshot tiers={tiers} />
        <TestimonialsCarousel testimonials={testimonials} />
        <FAQPreview faqs={faqs} />

        {/* CTA Section */}
        <section className="py-20 md:py-28" aria-labelledby="cta-heading">
          <div className="container">
            <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-[rgb(var(--lavender))]/20 to-[rgb(var(--tangerine))]/20 p-12 text-center">
              <h2 id="cta-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Ready to create personalized study materials?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join thousands of parents helping their children learn better.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" className="min-w-[200px]" asChild>
                  <Link to="/signup">Sign Up Free</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  )
}
