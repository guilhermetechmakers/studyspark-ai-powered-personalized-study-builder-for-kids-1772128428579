/**
 * Data contracts for Landing Page content.
 * Used for mock data and future API integration.
 * GET /pricing-tiers -> { data: PricingTier[] }
 * GET /testimonials -> { data: Testimonial[] }
 * GET /faqs -> { data: FAQItem[] }
 */

export interface PricingTier {
  id: string
  name: string
  price: number
  currency?: string
  features: string[]
  ctaLabel?: string
  description?: string
  highlighted?: boolean
}

export interface Testimonial {
  id: string
  author: string
  quote: string
  role?: string
  avatarUrl?: string
}

export interface FAQItem {
  id: string
  question: string
  answer: string
}

export interface Feature {
  id: string
  title: string
  description: string
  iconName: string
  gradient: string
}

export interface HowItWorksStep {
  step: number
  title: string
  description: string
}

export interface LandingPageData {
  hero?: {
    headline?: string
    subheadline?: string
    primaryCTALabel?: string
    secondaryCTALabel?: string
  }
  pricing?: {
    tiers?: PricingTier[]
  }
  testimonials?: Testimonial[]
  partnerLogos?: string[]
  faqs?: FAQItem[]
}
