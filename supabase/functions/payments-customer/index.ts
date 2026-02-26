/**
 * Supabase Edge Function: payments-customer
 * Gets or creates Stripe customer for the authenticated user.
 * GET /functions/v1/payments-customer - get customer
 * POST /functions/v1/payments-customer - create/ensure customer
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
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user?.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      const { data: customer } = await supabase
        .from('payment_customers')
        .select('*')
        .eq('user_id', user.id)
        .single()
      return new Response(
        JSON.stringify({ data: customer ?? null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}))
      const billingAddress = body?.billing_address ?? {}

      const { data: existing } = await supabase
        .from('payment_customers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (existing?.stripe_customer_id) {
        return new Response(
          JSON.stringify({ data: existing }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
      if (!stripeKey) {
        const { data: inserted } = await supabase
          .from('payment_customers')
          .insert({
            user_id: user.id,
            email: user.email ?? '',
            billing_address: billingAddress,
          })
          .select()
          .single()
        return new Response(
          JSON.stringify({ data: inserted ?? null }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' })
      const stripeCustomer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
        address: billingAddress?.line1
          ? {
              line1: billingAddress.line1,
              line2: billingAddress.line2,
              city: billingAddress.city,
              state: billingAddress.state,
              postal_code: billingAddress.postal_code,
              country: billingAddress.country,
            }
          : undefined,
      })

      const { data: inserted } = await supabase
        .from('payment_customers')
        .upsert({
          user_id: user.id,
          stripe_customer_id: stripeCustomer.id,
          email: user.email ?? '',
          billing_address: billingAddress,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        .select()
        .single()

      return new Response(
        JSON.stringify({ data: inserted ?? null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
