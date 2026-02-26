/**
 * Mock data for checkout when API is unavailable
 */

import type { ExportItem, PlanOption } from '@/types/checkout'

export const MOCK_EXPORT_ITEMS: ExportItem[] = [
  {
    id: 'pack-basic',
    name: 'Basic Printable Pack',
    description: 'PDF flashcards and worksheets',
    price: 9.99,
    currency: 'USD',
    type: 'one-time',
    quantity: 1,
  },
  {
    id: 'pack-premium',
    name: 'Premium Export Bundle',
    description: 'Full study set with quizzes and answer keys',
    price: 19.99,
    currency: 'USD',
    type: 'one-time',
    quantity: 1,
  },
]

export const MOCK_PLAN_OPTIONS: PlanOption[] = [
  {
    id: 'one-time',
    type: 'one-time',
    price: 0,
    description: 'Pay once for your selected export packs.',
    benefits: ['Instant download', 'No recurring charges', 'Keep forever'],
  },
  {
    id: 'monthly',
    type: 'subscription',
    interval: 'monthly',
    price: 4.99,
    description: 'Unlimited exports every month.',
    benefits: ['Unlimited PDF exports', 'Priority support', 'Cancel anytime'],
  },
  {
    id: 'annual',
    type: 'subscription',
    interval: 'annual',
    price: 39.99,
    description: 'Best value — save 33% vs monthly.',
    benefits: ['Unlimited exports', '2 months free', 'Priority support'],
  },
]
