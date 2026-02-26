/**
 * Supabase Edge Function: admin-audit-logs
 * GET admin audit logs with filters, pagination, and export.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function requireAdmin(req: Request): Promise<{ user: { id: string }; supabase: ReturnType<typeof createClient> } | null> {
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

  return { user, supabase }
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

    const { supabase } = ctx
    const url = new URL(req.url)

    const action = url.searchParams.get('action') ?? ''
    const targetType = url.searchParams.get('target_type') ?? ''
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10) || 50, 100)
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') ?? '0', 10))
    const format = url.searchParams.get('format') ?? 'json'

    let query = supabase
      .from('admin_audit_logs')
      .select('id, admin_id, action, target_id, target_type, payload, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (action) query = query.eq('action', action)
    if (targetType) query = query.eq('target_type', targetType)

    const { data: rows, count, error } = await query

    if (error) {
      return new Response(
        JSON.stringify({ message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const items = (Array.isArray(rows) ? rows : []).map((r: Record<string, unknown>) => ({
      id: r.id,
      adminId: r.admin_id,
      action: r.action,
      targetId: r.target_id,
      targetType: r.target_type,
      payload: r.payload ?? {},
      createdAt: r.created_at,
    }))

    if (format === 'csv') {
      const headers = ['id', 'adminId', 'action', 'targetId', 'targetType', 'createdAt']
      const csvRows = items.map((r: Record<string, unknown>) =>
        headers.map((h) => String(r[h] ?? '')).map((v) => `"${v.replace(/"/g, '""')}"`).join(',')
      )
      const csv = [headers.join(','), ...csvRows].join('\n')
      return new Response(csv, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      })
    }

    return new Response(
      JSON.stringify({ data: items, count: count ?? items.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
