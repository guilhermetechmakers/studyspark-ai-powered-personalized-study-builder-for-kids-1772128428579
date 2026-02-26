/**
 * Supabase Edge Function: payments-webhook-events
 * Lists webhook events for admin monitoring. Requires authenticated user.
 * GET /functions/v1/payments-webhook-events?limit=50&offset=0
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

    const url = new URL(req.url)
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '50', 10)))
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') ?? '0', 10))
    const status = url.searchParams.get('status')?.trim()

    let query = supabase
      .from('payment_webhook_events')
      .select('id, event_id, type, received_at, processed_at, status, retry_count, error_message')
      .order('received_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: rows, error } = await query.range(offset, offset + limit - 1)

    if (error) throw error
    const list = Array.isArray(rows) ? rows : []

    let countQuery = supabase
      .from('payment_webhook_events')
      .select('*', { count: 'exact', head: true })
    if (status) {
      countQuery = countQuery.eq('status', status)
    }
    const { count } = await countQuery

    return new Response(
      JSON.stringify({ data: list, events: list, count: count ?? list.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message, data: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
