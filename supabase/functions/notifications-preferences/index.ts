/**
 * Supabase Edge Function: notifications-preferences
 * GET: Fetch user notification preferences
 * POST: Update user notification preferences
 * GET /functions/v1/notifications-preferences
 * POST /functions/v1/notifications-preferences
 * Body: { email_marketing?, email_transactional?, push_enabled?, push_platforms?, unsubscribe_status? }
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

    if (req.method === 'GET') {
      const { data: row, error: fetchError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (fetchError) {
        return new Response(
          JSON.stringify({ message: fetchError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const prefs = row as Record<string, unknown> | null
      const defaults = {
        email_marketing: false,
        email_transactional: true,
        push_enabled: true,
        push_platforms: ['fcm', 'apns'],
        unsubscribe_status: 'active',
      }

      const result = prefs
        ? {
            id: prefs.id,
            userId: prefs.user_id,
            emailMarketing: Boolean(prefs.email_marketing ?? defaults.email_marketing),
            emailTransactional: Boolean(prefs.email_transactional ?? defaults.email_transactional),
            pushEnabled: Boolean(prefs.push_enabled ?? defaults.push_enabled),
            pushPlatforms: Array.isArray(prefs.push_platforms) ? prefs.push_platforms : defaults.push_platforms,
            unsubscribeStatus: String(prefs.unsubscribe_status ?? defaults.unsubscribe_status),
            updatedAt: prefs.updated_at ?? '',
          }
        : defaults

      return new Response(
        JSON.stringify({ data: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }
      if (typeof body.email_marketing === 'boolean') updates.email_marketing = body.email_marketing
      if (typeof body.email_transactional === 'boolean') updates.email_transactional = body.email_transactional
      if (typeof body.push_enabled === 'boolean') updates.push_enabled = body.push_enabled
      if (Array.isArray(body.push_platforms)) updates.push_platforms = body.push_platforms
      if (typeof body.unsubscribe_status === 'string') updates.unsubscribe_status = body.unsubscribe_status

      const { data: upserted, error: upsertError } = await supabase
        .from('notification_preferences')
        .upsert(
          {
            user_id: user.id,
            ...updates,
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single()

      if (upsertError) {
        return new Response(
          JSON.stringify({ message: upsertError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const p = upserted as Record<string, unknown>
      return new Response(
        JSON.stringify({
          data: {
            id: p.id,
            userId: p.user_id,
            emailMarketing: Boolean(p.email_marketing),
            emailTransactional: Boolean(p.email_transactional),
            pushEnabled: Boolean(p.push_enabled),
            pushPlatforms: Array.isArray(p.push_platforms) ? p.push_platforms : [],
            unsubscribeStatus: String(p.unsubscribe_status ?? 'active'),
            updatedAt: p.updated_at,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
