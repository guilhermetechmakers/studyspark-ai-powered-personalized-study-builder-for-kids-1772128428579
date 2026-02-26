/**
 * Supabase Edge Function: payments-webhook
 * Handles Stripe webhooks with idempotency. Processes subscription and invoice events.
 * POST /functions/v1/payments-webhook
 * Requires: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET in Supabase secrets
 */

import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!stripeKey || !webhookSecret) {
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' })
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response(
      JSON.stringify({ error: 'Missing stripe-signature' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const body = await req.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const eventId = event.id
  const { data: existing } = await supabase
    .from('payment_webhook_events')
    .select('id, status')
    .eq('event_id', eventId)
    .single()

  if (existing?.status === 'processed') {
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: inserted } = await supabase
    .from('payment_webhook_events')
    .insert({
      event_id: eventId,
      type: event.type,
      status: 'pending',
      payload: event as unknown as Record<string, unknown>,
    })
    .select('id')
    .single()

  const recordId = inserted?.id
  if (!recordId && existing?.id) {
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id
        if (!customerId) break
        const { data: cust } = await supabase
          .from('payment_customers')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()
        if (cust) {
          const status = sub.status ?? 'canceled'
          await supabase
            .from('payment_subscriptions')
            .upsert({
              stripe_subscription_id: sub.id,
              customer_id: cust.id,
              status,
              current_period_start: sub.current_period_start
                ? new Date(sub.current_period_start * 1000).toISOString()
                : null,
              current_period_end: sub.current_period_end
                ? new Date(sub.current_period_end * 1000).toISOString()
                : null,
              trial_end: sub.trial_end
                ? new Date(sub.trial_end * 1000).toISOString()
                : null,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'stripe_subscription_id' })
        }
        break
      }
      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice
        const customerId = typeof inv.customer === 'string' ? inv.customer : inv.customer?.id
        if (!customerId) break
        const { data: cust } = await supabase
          .from('payment_customers')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()
        if (cust) {
          await supabase.from('payment_invoices').upsert({
            stripe_invoice_id: inv.id,
            customer_id: cust.id,
            subscription_id: inv.subscription
              ? (await supabase
                  .from('payment_subscriptions')
                  .select('id')
                  .eq('stripe_subscription_id', inv.subscription)
                  .single()).data?.id ?? null
              : null,
            amount_due: (inv.amount_due ?? 0) / 100,
            currency: inv.currency ?? 'usd',
            status: inv.status ?? 'open',
            pdf_url: inv.invoice_pdf ?? null,
            hosted_invoice_url: inv.hosted_invoice_url ?? null,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'stripe_invoice_id' })
        }
        break
      }
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
        const clientRefId = session.client_reference_id ?? session.metadata?.user_id
        if (customerId && clientRefId) {
          await supabase.from('payment_customers').upsert({
            user_id: clientRefId,
            stripe_customer_id: customerId,
            email: session.customer_email ?? '',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' })
        }
        break
      }
      default:
        break
    }

    await supabase
      .from('payment_webhook_events')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString(),
      })
      .eq('event_id', eventId)
  } catch (err) {
    const errMsg = (err as Error).message
    await supabase
      .from('payment_webhook_events')
      .update({
        status: 'failed',
        error_message: errMsg,
        retry_count: (existing ? (existing as { retry_count?: number }).retry_count ?? 0 : 0) + 1,
      })
      .eq('event_id', eventId)
    return new Response(
      JSON.stringify({ error: errMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ received: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
