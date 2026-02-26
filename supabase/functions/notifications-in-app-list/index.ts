/**
 * Supabase Edge Function: notifications-in-app-list
 * Returns paginated in-app notifications for the current user.
 * GET /functions/v1/notifications-in-app-list?limit=20&offset=0&type=&unreadOnly=
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
    const url = new URL(req.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20', 10) || 20, 100)
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') ?? '0', 10))
    const typeFilter = url.searchParams.get('type') ?? ''
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true'

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ message: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let query = supabase
      .from('notifications_in_app')
      .select('id, title, message, data, read_at, created_at, type', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (typeFilter) {
      query = query.eq('type', typeFilter)
    }
    if (unreadOnly) {
      query = query.is('read_at', null)
    }

    const { data: rows, count, error } = await query

    const list = Array.isArray(rows) ? rows : []
    const items = list.map((r: Record<string, unknown>) => ({
      id: r.id,
      title: r.title ?? '',
      message: r.message ?? '',
      data: r.data ?? {},
      readAt: r.read_at ?? null,
      createdAt: r.created_at ?? '',
      type: r.type ?? 'general',
    }))

    return new Response(
      JSON.stringify({
        data: items,
        count: count ?? items.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message, data: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
