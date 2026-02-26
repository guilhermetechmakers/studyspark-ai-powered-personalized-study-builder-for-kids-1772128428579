/**
 * Supabase Edge Function: create-checkout-session
 * Creates Stripe PaymentIntent or Checkout session.
 * POST /functions/v1/create-checkout-session
 * Body: { items, plan?, promoCode?, billingDetails }
 * Requires: STRIPE_SECRET_KEY in Supabase secrets
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
    const body = await req.json().catch(() => ({}))
    const items = Array.isArray(body?.items) ? body.items : []
    const billingDetails = body?.billingDetails ?? {}
    const name = (billingDetails?.name ?? '').toString().trim()
    const email = (billingDetails?.email ?? '').toString().trim()

    if (!name || !email) {
      return new Response(
        JSON.stringify({ message: 'Name and email required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      const orderId = `ord_${Date.now()}`
      const amount = items.reduce((s: number, i: { price?: number; quantity?: number }) =>
        s + (Number(i?.price) || 0) * (Number(i?.quantity) || 1), 0)
      return new Response(
        JSON.stringify({
          orderId,
          amount: Math.round(amount * 100),
          currency: 'USD',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' })
    const amountCents = items.reduce((s: number, i: { price?: number; quantity?: number }) =>
      s + Math.round((Number(i?.price) || 0) * 100) * (Number(i?.quantity) || 1), 0)

    if (amountCents < 50) {
      return new Response(
        JSON.stringify({ message: 'Minimum amount is $0.50' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: { email, name },
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: order } = await supabase
      .from('orders')
      .insert({
        id: `ord_${Date.now()}`,
        total_amount: amountCents / 100,
        currency: 'USD',
        status: 'pending',
        items_json: items,
        payment_intent_id: paymentIntent.id,
      })
      .select('id')
      .single()

    const orderId = order?.id ?? `ord_${Date.now()}`

    return new Response(
      JSON.stringify({
        paymentIntentClientSecret: paymentIntent.client_secret,
        orderId,
        amount: amountCents,
        currency: 'USD',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
