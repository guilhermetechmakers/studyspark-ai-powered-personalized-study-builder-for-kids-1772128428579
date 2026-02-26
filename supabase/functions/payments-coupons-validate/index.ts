/**
 * Supabase Edge Function: payments-coupons-validate
 * Validate coupon/promo code for plan or amount.
 * POST /functions/v1/payments-coupons-validate
 * Body: { code: string, plan_id?: string, amount?: number }
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

    if (!code || code.length < 2) {
      return new Response(
        JSON.stringify({
          valid: false,
          message: 'Invalid code format',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: promo, error } = await supabase
      .from('promos')
      .select('*')
      .eq('code', code)
      .single()

    if (error || !promo) {
      return new Response(
        JSON.stringify({
          valid: false,
          message: 'Invalid or expired code',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const now = new Date().toISOString()
    const validFrom = promo.valid_from ? new Date(promo.valid_from).toISOString() : null
    const validUntil = promo.valid_until ?? promo.expires_at
    const validUntilStr = validUntil ? new Date(validUntil).toISOString() : null

    if (validFrom && now < validFrom) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Code not yet valid' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    if (validUntilStr && now > validUntilStr) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Code has expired' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const maxRedemptions = promo.max_redemptions ?? promo.usage_limit
    const redeemedCount = promo.redeemed_count ?? promo.usage_count ?? 0
    if (maxRedemptions != null && redeemedCount >= maxRedemptions) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Code redemption limit reached' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const discountType = (promo.discount_type ?? 'percent') as 'percent' | 'amount'
    const value = Number(promo.value) ?? 0

    return new Response(
      JSON.stringify({
        valid: true,
        discountType,
        value,
        message: 'Code applied',
        duration: promo.duration ?? 'once',
        duration_in_months: promo.duration_in_months ?? null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({
        valid: false,
        message: (err as Error).message,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
