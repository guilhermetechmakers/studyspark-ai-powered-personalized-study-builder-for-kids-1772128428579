/**
 * Checkout API layer.
 * All responses validated and defaulted to safe shapes.
 */

import { apiGet, apiPost } from '@/lib/api'
import type {
  ExportItem,
  PlanOption,
  PromoValidation,
  BillingDetails,
  CreateSessionResponse,
  VerifyResponse,
  Order,
} from '@/types/checkout'

interface ExportsItemsResponse {
  data?: ExportItem[]
}

interface PromoValidateBody {
  code: string
  itemsTotal: number
}

interface CreateSessionBody {
  items: ExportItem[]
  plan?: PlanOption
  promoCode?: string
  billingDetails: BillingDetails
}

interface VerifyBody {
  orderId: string
}

export async function fetchExportItems(): Promise<ExportItem[]> {
  try {
    const res = await apiGet<ExportsItemsResponse>('/api/exports/items')
    const list = Array.isArray(res?.data) ? res.data : []
    return list
  } catch {
    return []
  }
}

export async function validatePromoCode(
  code: string,
  itemsTotal: number
): Promise<PromoValidation> {
  try {
    const res = await apiPost<PromoValidation>('/api/promo/validate', {
      code,
      itemsTotal,
    } as PromoValidateBody)
    return {
      valid: res?.valid ?? false,
      discountType: res?.discountType,
      value: res?.value ?? 0,
      message: res?.message,
    }
  } catch {
    return { valid: false, message: 'Validation failed' }
  }
}

export async function createCheckoutSession(
  body: CreateSessionBody
): Promise<CreateSessionResponse> {
  const res = await apiPost<CreateSessionResponse>('/api/checkout/create-session', body)
  return {
    sessionId: res?.sessionId,
    paymentIntentClientSecret: res?.paymentIntentClientSecret,
    orderId: res?.orderId ?? '',
    amount: res?.amount ?? 0,
    currency: res?.currency ?? 'USD',
  }
}

export async function verifyPayment(orderId: string): Promise<VerifyResponse> {
  try {
    const res = await apiPost<VerifyResponse>('/api/checkout/verify', {
      orderId,
    } as VerifyBody)
    return {
      success: res?.success ?? false,
      receiptLink: res?.receiptLink,
      downloadLinks: Array.isArray(res?.downloadLinks) ? res.downloadLinks : [],
      order: res?.order,
    }
  } catch {
    return { success: false }
  }
}

export async function fetchOrder(orderId: string): Promise<Order | null> {
  try {
    const res = await apiGet<Order>(`/api/orders/${orderId}`)
    return res ?? null
  } catch {
    return null
  }
}
