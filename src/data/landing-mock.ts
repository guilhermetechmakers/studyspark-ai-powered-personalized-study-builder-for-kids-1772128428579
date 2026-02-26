/**
 * Mock data for Landing Page.
 * Replace with API calls when endpoints are available.
 * All arrays use safe defaults for null-safe rendering.
 */

import type { PricingTier, Testimonial, FAQItem } from '@/types/landing'

export const mockPricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    features: ['3 studies per month', 'Basic flashcards', 'Email support'],
    ctaLabel: 'Start Free',
    description: 'Get started with basic study creation',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 12,
    currency: 'USD',
    features: [
      'Unlimited studies',
      'All formats (PDF, flashcards, quizzes)',
      'Priority generation',
      'Priority support',
    ],
    ctaLabel: 'Start Pro Trial',
    description: 'For active families',
    highlighted: true,
  },
  {
    id: 'family',
    name: 'Family',
    price: 24,
    currency: 'USD',
    features: [
      'Everything in Pro',
      'Up to 4 child profiles',
      'Bulk export',
      'Advanced analytics',
    ],
    ctaLabel: 'Start Family Trial',
    description: 'Up to 4 children',
    highlighted: false,
  },
]

export const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    author: 'Sarah M.',
    quote:
      'StudySpark saved me hours. I upload my son\'s teacher notes and get tailored flashcards in minutes. He actually enjoys studying now!',
    role: 'Parent of 3rd grader',
  },
  {
    id: '2',
    author: 'James L.',
    quote:
      'The age-appropriate content is a game-changer. My daughter gets material that matches her reading level—no more frustration.',
    role: 'Homeschool parent',
  },
  {
    id: '3',
    author: 'Maria K.',
    quote:
      'I love that I can review and edit everything before my kids see it. Full control, AI-powered convenience.',
    role: 'Parent of twins',
  },
]

export const mockPartnerLogos: string[] = [
  // Placeholder: in production, use actual logo URLs
  // 'logo-1.svg', 'logo-2.svg', etc.
]

export const mockFAQs: FAQItem[] = [
  {
    id: '1',
    question: 'Is my child\'s data safe?',
    answer:
      'Yes. We follow COPPA and GDPR guidelines. We store minimal child data, use encrypted storage, and never sell personal information. Parents control all data.',
  },
  {
    id: '2',
    question: 'How does the AI tailor content?',
    answer:
      'We use your child\'s age, grade, and chosen learning style (playful, exam-like, research-based, printable) to shape prompts. The AI adapts vocabulary, length, and format accordingly.',
  },
  {
    id: '3',
    question: 'Can I edit AI-generated content?',
    answer:
      'Absolutely. You can edit any block inline or request targeted revisions from the AI. Nothing goes to your child until you approve it.',
  },
  {
    id: '4',
    question: 'What file types can I upload?',
    answer:
      'We support photos (JPG, PNG), PDFs, and common document formats. Our OCR handles handwritten notes and printed text.',
  },
  {
    id: '5',
    question: 'How many studies can I create on the free plan?',
    answer:
      'The free plan includes 3 studies per month. Upgrade to Pro for unlimited studies and all output formats.',
  },
  {
    id: '6',
    question: 'Can I use StudySpark for multiple children?',
    answer:
      'Yes. The Family plan supports up to 4 child profiles with separate learning styles and age settings. Each child gets personalized content.',
  },
]

/** Safe getter for pricing tiers from API-like response */
export function getPricingTiers(data: { tiers?: PricingTier[] } | null | undefined): PricingTier[] {
  const tiers = data?.tiers ?? []
  return Array.isArray(tiers) ? tiers : []
}

/** Safe getter for testimonials from API-like response */
export function getTestimonials(data: { testimonials?: Testimonial[] } | null | undefined): Testimonial[] {
  const items = data?.testimonials ?? []
  return Array.isArray(items) ? items : []
}

/** Safe getter for FAQs from API-like response */
export function getFAQs(data: { faqs?: FAQItem[] } | null | undefined): FAQItem[] {
  const items = data?.faqs ?? []
  return Array.isArray(items) ? items : []
}

/** Safe getter for partner logos from API-like response */
export function getPartnerLogos(data: { partnerLogos?: string[] } | null | undefined): string[] {
  const logos = data?.partnerLogos ?? []
  return Array.isArray(logos) ? logos : []
}
