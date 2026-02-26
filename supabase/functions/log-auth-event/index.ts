/**
 * Supabase Edge Function: log-auth-event
 * Logs authentication events to audit_logs table.
 * POST /functions/v1/log-auth-event
 * Body: { action: string, success: boolean, metadata?: object }
 * Requires: Authorization: Bearer <access_token>
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
    const token = authHeader?.replace('Bearer ', '') ?? ''
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const body = (await req.json().catch(() => ({}))) as {
      action?: string
      success?: boolean
      metadata?: Record<string, unknown>
    }
    const action = (body?.action ?? 'unknown').toString().trim()
    const success = Boolean(body?.success)
    const metadata = body?.metadata ?? {}

    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    let userId: string | null = null
    if (token && supabaseAnonKey) {
      const userClient = createClient(supabaseUrl, supabaseAnonKey)
      const { data: { user } } = await userClient.auth.getUser(token)
      userId = user?.id ?? null
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey)
    await adminClient.from('audit_logs').insert({
      user_id: userId,
      action,
      success,
      ip_address: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null,
      metadata,
    })

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
