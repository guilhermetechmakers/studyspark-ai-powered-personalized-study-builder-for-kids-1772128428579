/**
 * Supabase Edge Function: payments-invoice
 * Get single invoice by ID for the authenticated user.
 * GET /functions/v1/payments-invoice?id=xxx
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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ message: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const id = url.searchParams.get('id') ?? ''
    if (!id) {
      return new Response(
        JSON.stringify({ message: 'id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    const { data: inv, error } = await supabaseAdmin
      .from('payment_invoices')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !inv) {
      return new Response(
        JSON.stringify({ message: 'Invoice not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: cust } = await supabaseAdmin
      .from('payment_customers')
      .select('user_id')
      .eq('id', inv.customer_id)
      .single()

    if (cust?.user_id !== user.id) {
      return new Response(
        JSON.stringify({ message: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const invoice = {
      id: inv.id,
      stripe_invoice_id: inv.stripe_invoice_id ?? null,
      customer_id: inv.customer_id,
      subscription_id: inv.subscription_id ?? null,
      amount_due: Number(inv.amount_due) ?? 0,
      currency: String(inv.currency ?? 'USD'),
      status: inv.status ?? 'draft',
      pdf_url: inv.pdf_url ?? null,
      hosted_invoice_url: inv.hosted_invoice_url ?? null,
      created_at: inv.created_at,
      updated_at: inv.updated_at,
    }

    return new Response(
      JSON.stringify({ invoice, data: invoice }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
