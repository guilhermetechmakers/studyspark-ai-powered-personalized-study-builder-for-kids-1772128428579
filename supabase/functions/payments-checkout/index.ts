/**
 * Supabase Edge Function: payments-checkout
 * Create Stripe Checkout session for subscription or one-time purchase.
 * POST /functions/v1/payments-checkout
 * Body: { plan_id?, price_ids?, success_url?, cancel_url?, coupon_code?, customer_email? }
 * Requires: STRIPE_SECRET_KEY
 */

import Stripe from 'https://esm.sh/stripe@14?target=deno'
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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json().catch(() => ({}))
    const planId = (body?.plan_id ?? '').toString().trim()
    const priceIds = Array.isArray(body?.price_ids) ? body.price_ids : []
    const successUrl = (body?.success_url ?? '').toString().trim() ||
      `${Deno.env.get('SITE_URL') ?? 'http://localhost:5173'}/dashboard/payments?success=1`
    const cancelUrl = (body?.cancel_url ?? '').toString().trim() ||
      `${Deno.env.get('SITE_URL') ?? 'http://localhost:5173'}/dashboard/payments`

    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let stripePriceId: string | null = null
    if (planId) {
      const { data: plan } = await supabaseAdmin
        .from('payment_plans')
        .select('stripe_price_id, trial_period_days')
        .eq('id', planId)
        .eq('active', true)
        .single()
      stripePriceId = plan?.stripe_price_id ?? null
    }
    if (!stripePriceId && priceIds.length > 0) {
      stripePriceId = priceIds[0]
    }
    if (!stripePriceId) {
      return new Response(
        JSON.stringify({ error: 'plan_id or price_ids required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: cust } = await supabaseAdmin
      .from('payment_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let stripeCustomerId = cust?.stripe_customer_id
    if (!stripeCustomerId) {
      const stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' })
      const sc = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      })
      stripeCustomerId = sc.id
      await supabaseAdmin.from('payment_customers').insert({
        user_id: user.id,
        stripe_customer_id: sc.id,
        email: user.email ?? null,
      })
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' })
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      metadata: { user_id: user.id },
    })

    return new Response(
      JSON.stringify({ session_id: session.id, url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
