/**
 * Supabase Edge Function: payments-webhooks-list
 * List webhook events (admin). Uses service role to bypass RLS.
 * GET /functions/v1/payments-webhooks-list?limit=50&offset=0&status=
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
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10) || 50, 100)
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') ?? '0', 10))
    const statusFilter = url.searchParams.get('status') ?? ''

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

    let query = supabaseAdmin
      .from('payment_webhook_events')
      .select('*')
      .order('received_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }

    const { data: rows } = await query

    const list = Array.isArray(rows) ? rows : []
    const events = list.map((r: Record<string, unknown>) => ({
      id: r.id,
      event_id: r.event_id,
      type: r.type,
      received_at: r.received_at,
      processed_at: r.processed_at ?? null,
      status: r.status ?? 'pending',
      retry_count: r.retry_count ?? 0,
      error_message: r.error_message ?? null,
    }))

    return new Response(
      JSON.stringify({ data: events, events }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message, data: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
