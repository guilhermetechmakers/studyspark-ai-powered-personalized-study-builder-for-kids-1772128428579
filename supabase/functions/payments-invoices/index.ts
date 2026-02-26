/**
 * Supabase Edge Function: payments-invoices
 * List invoices for the authenticated user.
 * GET /functions/v1/payments-invoices?limit=20&offset=0
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
        JSON.stringify({ message: 'Missing authorization', data: [] }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20', 10) || 20, 100)
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') ?? '0', 10))

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
        JSON.stringify({ message: 'Unauthorized', data: [] }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: customers } = await supabaseAdmin
      .from('payment_customers')
      .select('id')
      .eq('user_id', user.id)
    const customerIds = (customers ?? []).map((c: { id: string }) => c.id)
    if (customerIds.length === 0) {
      return new Response(
        JSON.stringify({ data: [], invoices: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: rows } = await supabaseAdmin
      .from('payment_invoices')
      .select('*')
      .in('customer_id', customerIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const list = Array.isArray(rows) ? rows : []
    const invoices = list.map((r: Record<string, unknown>) => ({
      id: r.id,
      stripe_invoice_id: r.stripe_invoice_id ?? null,
      customer_id: r.customer_id,
      subscription_id: r.subscription_id ?? null,
      amount_due: Number(r.amount_due) ?? 0,
      currency: String(r.currency ?? 'USD'),
      status: r.status ?? 'draft',
      pdf_url: r.pdf_url ?? null,
      hosted_invoice_url: r.hosted_invoice_url ?? null,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }))

    return new Response(
      JSON.stringify({ data: invoices, invoices }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message, data: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
