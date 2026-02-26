/**
 * Payments & Subscription type definitions.
 * All types support runtime safety with optional chaining and defaults.
 */

export interface PaymentPlan {
  id: string
  name: string
  stripe_price_id?: string | null
  stripe_product_id?: string | null
  amount: number
  currency: string
  interval: 'month' | 'year'
  trial_period_days?: number
  active?: boolean
  metadata?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface PaymentCustomer {
  id: string
  user_id: string
  stripe_customer_id?: string | null
  email: string
  billing_address?: Record<string, unknown>
  metadata?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused'

export interface PaymentSubscription {
  id: string
  customer_id: string
  stripe_subscription_id?: string | null
  plan_id?: string | null
  plan?: PaymentPlan | null
  status: SubscriptionStatus
  current_period_start?: string | null
  current_period_end?: string | null
  trial_end?: string | null
  quantity: number
  metadata?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'

export interface PaymentInvoice {
  id: string
  stripe_invoice_id?: string | null
  customer_id: string
  subscription_id?: string | null
  amount_due: number
  currency: string
  status: InvoiceStatus
  pdf_url?: string | null
  hosted_invoice_url?: string | null
  created_at?: string
  updated_at?: string
}

export interface CouponValidation {
  valid: boolean
  message?: string
  discountType?: 'percent' | 'amount'
  value?: number
  discount?: number
  stripeCouponId?: string | null
}

export interface WebhookEvent {
  id: string
  event_id: string
  type: string
  received_at: string
  processed_at?: string | null
  status: 'pending' | 'processed' | 'failed'
  retry_count: number
  error_message?: string | null
}
