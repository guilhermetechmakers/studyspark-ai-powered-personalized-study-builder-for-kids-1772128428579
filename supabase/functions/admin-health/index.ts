/**
 * Supabase Edge Function: admin-health
 * Returns system health summary and logs.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function requireAdmin(req: Request): Promise<{ supabase: ReturnType<typeof createClient> } | null> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return null

  const supabaseAuth = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error } = await supabaseAuth.auth.getUser(authHeader.replace('Bearer ', ''))
  if (error || !user) return null

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const role = (profile as { role?: string } | null)?.role
  if (role !== 'admin' && role !== 'moderator') return null

  return { supabase }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const ctx = await requireAdmin(req)
    if (!ctx) {
      return new Response(
        JSON.stringify({ message: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const summary = {
      queueBacklog: 12,
      aiApiUsage: 78,
      errorCount: 3,
      lastUpdated: new Date().toISOString(),
    }

    const mockLogs = [
      { id: 'l1', timestamp: new Date().toISOString(), level: 'info', component: 'auth', message: 'User login successful', correlationId: 'corr-001' },
      { id: 'l2', timestamp: new Date().toISOString(), level: 'warn', component: 'ai-api', message: 'Rate limit approaching (85%)', correlationId: 'corr-002' },
      { id: 'l3', timestamp: new Date().toISOString(), level: 'error', component: 'payment', message: 'Stripe webhook validation failed', correlationId: 'corr-003' },
    ]

    return new Response(
      JSON.stringify({
        data: {
          summary,
          logs: mockLogs,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
