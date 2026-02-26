/**
 * Supabase Edge Function: payments-webhooks
 * Stripe webhook handler with idempotency.
 * POST /functions/v1/payments-webhooks
 * Requires: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
 * Verify Stripe signature, store event_id, process idempotently
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

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!stripeKey || !webhookSecret) {
    return new Response(
      JSON.stringify({ message: 'Webhook not configured' }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const signature = req.headers.get('stripe-signature') ?? ''
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' }).webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: `Webhook signature verification failed: ${(err as Error).message}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { data: existing } = await supabase
    .from('payment_webhook_events')
    .select('id, status')
    .eq('event_id', event.id)
    .single()

  if (existing) {
    return new Response(
      JSON.stringify({ received: true, idempotent: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  await supabase.from('payment_webhook_events').insert({
    event_id: event.id,
    type: event.type,
    status: 'pending',
    details: event as unknown as Record<string, unknown>,
  })

  try {
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' })

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const custId = sub.customer as string
        const { data: cust } = await supabase
          .from('payment_customers')
          .select('id')
          .eq('stripe_customer_id', custId)
          .single()
        if (cust) {
          const planId = sub.items?.data?.[0]?.price?.id
            ? (await supabase.from('payment_plans').select('id').eq('stripe_price_id', sub.items.data[0].price.id).single()).data?.id
            : null
          await supabase.from('payment_subscriptions').upsert({
            stripe_subscription_id: sub.id,
            customer_id: cust.id,
            plan_id: planId ?? null,
            status: sub.status,
            current_period_start: sub.current_period_start
              ? new Date(sub.current_period_start * 1000).toISOString()
              : null,
            current_period_end: sub.current_period_end
              ? new Date(sub.current_period_end * 1000).toISOString()
              : null,
            trial_end: sub.trial_end
              ? new Date(sub.trial_end * 1000).toISOString()
              : null,
            quantity: sub.items?.data?.[0]?.quantity ?? 1,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'stripe_subscription_id' })
        }
        break
      }
      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice
        const custId = inv.customer as string
        const { data: cust } = await supabase
          .from('payment_customers')
          .select('id')
          .eq('stripe_customer_id', custId)
          .single()
        if (cust) {
          const subId = inv.subscription as string | null
          let subscriptionId: string | null = null
          if (subId) {
            const { data: sub } = await supabase
              .from('payment_subscriptions')
              .select('id')
              .eq('stripe_subscription_id', subId)
              .single()
            subscriptionId = sub?.id ?? null
          }
          await supabase.from('payment_invoices').upsert({
            stripe_invoice_id: inv.id,
            customer_id: cust.id,
            subscription_id: subscriptionId,
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
        if (session.mode === 'subscription' && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string)
          const custId = sub.customer as string
          const { data: cust } = await supabase
            .from('payment_customers')
            .select('id')
            .eq('stripe_customer_id', custId)
            .single()
          if (cust) {
            const planId = sub.items?.data?.[0]?.price?.id
              ? (await supabase.from('payment_plans').select('id').eq('stripe_price_id', sub.items.data[0].price.id).single()).data?.id
              : null
            await supabase.from('payment_subscriptions').insert({
              stripe_subscription_id: sub.id,
              customer_id: cust.id,
              plan_id: planId ?? null,
              status: sub.status,
              current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
              current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
              trial_end: sub.trial_end
                ? new Date(sub.trial_end * 1000).toISOString()
                : null,
              quantity: sub.items?.data?.[0]?.quantity ?? 1,
            })
          }
        }
        break
      }
      default:
        break
    }

    await supabase
      .from('payment_webhook_events')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('event_id', event.id)
  } catch (err) {
    await supabase
      .from('payment_webhook_events')
      .update({
        status: 'failed',
        error_message: (err as Error).message,
        retry_count: 1,
      })
      .eq('event_id', event.id)
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ received: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
