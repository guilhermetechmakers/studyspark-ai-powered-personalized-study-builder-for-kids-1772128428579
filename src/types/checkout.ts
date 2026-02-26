/**
 * Checkout page types for Export / Checkout flow.
 * All types support optional fields and safe defaults.
 */

export interface ExportItem {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  type: 'one-time' | 'subscription'
  quantity?: number
}

export interface PlanOption {
  id: string
  type: 'one-time' | 'subscription'
  interval?: 'monthly' | 'annual'
  price: number
  description: string
  benefits: string[]
  currency?: string
}

export interface PromoValidation {
  valid: boolean
  discountType?: 'percent' | 'amount'
  value?: number
  message?: string
}

export interface Order {
  id: string
  userId?: string
  totalAmount: number
  currency: string
  status: 'pending' | 'paid' | 'failed'
  items: ExportItem[]
  promoCode?: string
  paymentIntentId?: string
  createdAt: string
  downloadLinks?: string[]
}

export interface BillingDetails {
  name: string
  email: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

export interface CreateSessionResponse {
  sessionId?: string
  paymentIntentClientSecret?: string
  orderId: string
  amount: number
  currency: string
}

export interface VerifyResponse {
  success: boolean
  receiptLink?: string
  downloadLinks?: string[]
  order?: Order
}

export type PurchaseType = 'one-time' | 'subscription'
