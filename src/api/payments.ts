/**
 * Payments API layer.
 * Invokes Supabase Edge Functions for billing, subscriptions, invoices.
 * All responses validated with runtime safety (data ?? [], Array.isArray).
 */

import { apiGet, apiPost } from '@/lib/api'
import type {
  PaymentPlan,
  PaymentCustomer,
  PaymentSubscription,
  PaymentInvoice,
  CouponValidation,
  WebhookEvent,
} from '@/types/payments'

const FUNC = (name: string) => `/${name}`

function safeArray<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : []
}

export async function fetchPlans(): Promise<PaymentPlan[]> {
  try {
    const res = await apiGet<{ data?: PaymentPlan[] }>(FUNC('payments-plans'))
    const list = Array.isArray(res?.data) ? res.data : []
    return list
  } catch {
    return []
  }
}

export async function fetchCustomer(): Promise<PaymentCustomer | null> {
  try {
    const res = await apiGet<{ data?: PaymentCustomer | null }>(FUNC('payments-customer'))
    return res?.data ?? null
  } catch {
    return null
  }
}

export async function ensureCustomer(billingAddress?: Record<string, unknown>): Promise<PaymentCustomer | null> {
  try {
    const res = await apiPost<{ data?: PaymentCustomer | null }>(FUNC('payments-customer'), {
      billing_address: billingAddress ?? {},
    })
    return res?.data ?? null
  } catch {
    return null
  }
}

export async function fetchSubscriptions(): Promise<PaymentSubscription[]> {
  try {
    const res = await apiGet<{ data?: PaymentSubscription[]; subscriptions?: PaymentSubscription[] }>(
      FUNC('payments-subscriptions')
    )
    const list = Array.isArray(res?.data) ? res.data : safeArray<PaymentSubscription>(res?.subscriptions)
    return list
  } catch {
    return []
  }
}

export async function createSubscription(params: {
  plan_id: string
  coupon_code?: string
  success_url?: string
  cancel_url?: string
}): Promise<{ session_id?: string; url?: string } | null> {
  try {
    const res = await apiPost<{ session_id?: string; url?: string }>(FUNC('payments-subscriptions'), {
      plan_id: params.plan_id,
      coupon_code: params.coupon_code,
      couponCode: params.coupon_code,
      success_url: params.success_url,
      cancel_url: params.cancel_url,
    })
    return res ?? null
  } catch {
    return null
  }
}

export async function fetchInvoices(params?: { limit?: number; offset?: number }): Promise<{
  data: PaymentInvoice[]
  count: number
}> {
  try {
    const qs = new URLSearchParams()
    if (params?.limit != null) qs.set('limit', String(params.limit))
    if (params?.offset != null) qs.set('offset', String(params.offset))
    const path = qs.toString() ? `${FUNC('payments-invoices')}?${qs}` : FUNC('payments-invoices')
    const res = await apiGet<{ data?: PaymentInvoice[]; invoices?: PaymentInvoice[]; count?: number }>(path)
    const list = Array.isArray(res?.data) ? res.data : safeArray<PaymentInvoice>(res?.invoices)
    const count = res?.count ?? list.length
    return { data: list, count }
  } catch {
    return { data: [], count: 0 }
  }
}

export async function getBillingPortalUrl(returnUrl?: string): Promise<string | null> {
  try {
    const res = await apiPost<{ url?: string }>(FUNC('payments-billing-portal'), {
      return_url: returnUrl,
      returnUrl,
    })
    return res?.url ?? null
  } catch {
    return null
  }
}

/** Alias for getBillingPortalUrl returning { url, error } */
export async function createBillingPortalSession(returnUrl?: string): Promise<{ url?: string; error?: string }> {
  try {
    const url = await getBillingPortalUrl(returnUrl)
    return url ? { url } : { error: 'Could not create portal session' }
  } catch {
    return { error: 'Could not create portal session' }
  }
}

/** Create Stripe Checkout session for subscription */
export async function createCheckoutSession(params: {
  plan_id: string
  coupon_code?: string
  success_url?: string
  cancel_url?: string
}): Promise<{ session_id?: string; url?: string; error?: string }> {
  try {
    const res = await createSubscription(params)
    if (res?.url) return { url: res.url, session_id: res.session_id }
    return { error: 'Could not create checkout session' }
  } catch {
    return { error: 'Could not create checkout session' }
  }
}

/** List webhook events (admin) */
export async function fetchWebhookEvents(params?: {
  limit?: number
  offset?: number
  status?: string
}): Promise<WebhookEvent[]> {
  try {
    const qs = new URLSearchParams()
    if (params?.limit != null) qs.set('limit', String(params.limit))
    if (params?.offset != null) qs.set('offset', String(params.offset))
    if (params?.status) qs.set('status', params.status)
    const path = qs.toString() ? `${FUNC('payments-webhooks-list')}?${qs}` : FUNC('payments-webhooks-list')
    const res = await apiGet<{ data?: WebhookEvent[]; events?: WebhookEvent[] }>(path)
    return Array.isArray(res?.data) ? res.data : safeArray<WebhookEvent>(res?.events)
  } catch {
    return []
  }
}

export async function validateCoupon(params: {
  code: string
  amount?: number
  planId?: string
}): Promise<CouponValidation> {
  try {
    const res = await apiPost<CouponValidation>(FUNC('payments-coupons-validate'), {
      code: params.code,
      amount: params.amount ?? 0,
      plan_id: params.planId,
    })
    return {
      valid: res?.valid ?? false,
      message: res?.message,
      discountType: res?.discountType,
      value: res?.value ?? 0,
      discount: res?.discount,
      stripeCouponId: res?.stripeCouponId,
    }
  } catch {
    return { valid: false, message: 'Validation failed' }
  }
}
