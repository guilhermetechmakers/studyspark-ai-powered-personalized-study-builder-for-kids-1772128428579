/**
 * Supabase Edge Function: payments-coupon-validate
 * Validates coupon code for subscription or checkout.
 * POST /functions/v1/payments-coupon-validate
 * Body: { code: string, amount?: number, planId?: string }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const code = (body?.code ?? '').toString().trim().toUpperCase()
    const amount = Number(body?.amount) || 0
    const planId = (body?.planId ?? '').toString().trim()

    if (!code || code.length < 2) {
      return new Response(
        JSON.stringify({
          valid: false,
          message: 'Invalid code format',
          discountType: null,
          value: null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: coupon, error } = await supabase
      .from('payment_coupons')
      .select('*')
      .eq('code', code)
      .eq('active', true)
      .single()

    if (error || !coupon) {
      return new Response(
        JSON.stringify({
          valid: false,
          message: 'Invalid or expired code',
          discountType: null,
          value: null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const now = new Date()
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return new Response(
        JSON.stringify({
          valid: false,
          message: 'This code has expired',
          discountType: null,
          value: null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const maxRedemptions = coupon.max_redemptions
    const redeemedCount = Number(coupon.redeemed_count) || 0
    if (maxRedemptions != null && redeemedCount >= maxRedemptions) {
      return new Response(
        JSON.stringify({
          valid: false,
          message: 'This code has reached its usage limit',
          discountType: null,
          value: null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const discountType = coupon.discount_type ?? 'percent'
    const value = Number(coupon.discount_value) ?? 0
    const discount =
      discountType === 'percent'
        ? (amount * value) / 100
        : Math.min(value, amount)

    return new Response(
      JSON.stringify({
        valid: true,
        message: 'Code applied',
        discountType,
        value,
        discount,
        stripeCouponId: coupon.stripe_coupon_id ?? null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({
        valid: false,
        message: (err as Error).message,
        discountType: null,
        value: null,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
