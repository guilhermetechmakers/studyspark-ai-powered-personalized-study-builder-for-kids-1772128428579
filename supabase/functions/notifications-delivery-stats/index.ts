/**
 * Supabase Edge Function: notifications-delivery-stats
 * Returns delivery stats for admin dashboard.
 * GET /functions/v1/notifications-delivery-stats
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseService = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? supabaseAnon

    const supabaseAuth = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    })
    const supabase = createClient(supabaseUrl, supabaseService)

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: logs } = await supabase
      .from('notification_email_logs')
      .select('status')

    const list = Array.isArray(logs) ? logs : []
    const stats = {
      total: list.length,
      delivered: list.filter((r: Record<string, unknown>) =>
        ['delivered', 'opened', 'clicked', 'sent'].includes(String(r.status ?? ''))
      ).length,
      opened: list.filter((r: Record<string, unknown>) => r.status === 'opened').length,
      clicked: list.filter((r: Record<string, unknown>) => r.status === 'clicked').length,
      bounced: list.filter((r: Record<string, unknown>) => r.status === 'bounced').length,
      failed: list.filter((r: Record<string, unknown>) => r.status === 'failed').length,
    }

    return new Response(
      JSON.stringify({ data: stats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
