/**
 * Supabase Edge Function: verify-payment
 * Verifies payment status after client confirmation.
 * POST /functions/v1/verify-payment
 * Body: { orderId: string }
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
    const orderId = (body?.orderId ?? '').toString().trim()

    if (!orderId) {
      return new Response(
        JSON.stringify({ success: false, message: 'orderId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return new Response(
        JSON.stringify({ success: false, message: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const paymentIntentId = order?.payment_intent_id
    if (paymentIntentId) {
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
      if (stripeKey) {
        const stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' })
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
        if (pi.status !== 'succeeded') {
          return new Response(
            JSON.stringify({ success: false, message: 'Payment not completed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', orderId)

    const items = Array.isArray(order?.items_json) ? order.items_json : []
    const downloadLinks = items.map((_: unknown, i: number) => `#download-${orderId}-${i}`)

    return new Response(
      JSON.stringify({
        success: true,
        receiptLink: `#receipt/${orderId}`,
        downloadLinks,
        order: {
          id: order.id,
          totalAmount: order.total_amount,
          currency: order.currency ?? 'USD',
          status: 'paid',
          items,
          downloadLinks,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
