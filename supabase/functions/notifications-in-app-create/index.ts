/**
 * Supabase Edge Function: notifications-in-app-create
 * Creates an in-app notification. Used by admin or system triggers.
 * POST /functions/v1/notifications-in-app-create
 * Body: { userId, title, message, type?, data? }
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

    const body = (await req.json()) as Record<string, unknown>
    const userId = body?.userId ? String(body.userId) : user.id
    const title = body?.title ? String(body.title) : ''
    const message = body?.message ? String(body.message) : ''
    const type = body?.type ? String(body.type) : 'general'
    const data = (body?.data as Record<string, unknown>) ?? {}

    if (!title || !message) {
      return new Response(
        JSON.stringify({ message: 'title and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: row, error } = await supabase
      .from('notifications_in_app')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        data,
      })
      .select()
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const r = (row ?? {}) as Record<string, unknown>
    const notification = {
      id: r.id,
      userId: r.user_id,
      title: r.title,
      message: r.message,
      data: r.data,
      readAt: r.read_at,
      createdAt: r.created_at,
      type: r.type,
    }

    return new Response(
      JSON.stringify({ data: notification }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
