/**
 * Supabase Edge Function: payments-subscriptions
 * GET: List subscriptions for current user
 * POST: Create new subscription
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

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(
      JSON.stringify({ message: 'Missing authorization' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

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
      JSON.stringify({ message: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  if (req.method === 'GET') {
    const { data: customers } = await supabaseAdmin
      .from('payment_customers')
      .select('id')
      .eq('user_id', user.id)
    const customerIds = (customers ?? []).map((c: { id: string }) => c.id)
    if (customerIds.length === 0) {
      return new Response(
        JSON.stringify({ data: [], subscriptions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: subs } = await supabaseAdmin
      .from('payment_subscriptions')
      .select('*, payment_plans(*)')
      .in('customer_id', customerIds)
      .order('created_at', { ascending: false })

    const list = Array.isArray(subs) ? subs : []
    const subscriptions = list.map((s: Record<string, unknown>) => {
      const plan = s.payment_plans as Record<string, unknown> | null
      return {
        id: s.id,
        customer_id: s.customer_id,
        stripe_subscription_id: s.stripe_subscription_id,
        plan_id: s.plan_id,
        plan: plan ? {
          id: plan.id,
          name: plan.name,
          amount: Number(plan.amount) ?? 0,
          currency: plan.currency ?? 'USD',
          interval: plan.interval,
          trial_period_days: plan.trial_period_days ?? 0,
        } : null,
        status: s.status,
        current_period_start: s.current_period_start,
        current_period_end: s.current_period_end,
        trial_end: s.trial_end,
        quantity: s.quantity ?? 1,
        created_at: s.created_at,
        updated_at: s.updated_at,
      }
    })

    return new Response(
      JSON.stringify({ data: subscriptions, subscriptions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (req.method === 'POST') {
    const body = await req.json().catch(() => ({}))
    const planId = (body?.plan_id ?? '').toString().trim()

    if (!planId) {
      return new Response(
        JSON.stringify({ error: 'plan_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: plan } = await supabaseAdmin
      .from('payment_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (!plan?.stripe_price_id) {
      return new Response(
        JSON.stringify({ error: 'Plan not found or not configured for Stripe' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: cust } = await supabaseAdmin
      .from('payment_customers')
      .select('*')
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
    const sessionParams: Record<string, unknown> = {
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [{
        price: plan.stripe_price_id,
        quantity: 1,
      }],
      success_url: (body?.success_url ?? `${Deno.env.get('SITE_URL') ?? 'http://localhost:5173'}/dashboard/payments?success=1`),
      cancel_url: (body?.cancel_url ?? `${Deno.env.get('SITE_URL') ?? 'http://localhost:5173'}/dashboard/payments`),
      metadata: { user_id: user.id },
      allow_promotion_codes: true,
    }

    if (plan.trial_period_days && plan.trial_period_days > 0) {
      sessionParams.subscription_data = {
        trial_period_days: plan.trial_period_days,
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams as Parameters<Stripe['checkout']['sessions']['create']>[0])

    return new Response(
      JSON.stringify({
        session_id: session.id,
        url: session.url,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ message: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
