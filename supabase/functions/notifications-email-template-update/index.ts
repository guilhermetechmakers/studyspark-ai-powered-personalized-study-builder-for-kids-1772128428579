/**
 * Supabase Edge Function: notifications-email-template-update
 * Update email template by id. Admin-only.
 * POST /functions/v1/notifications-email-template-update
 * Body: { id: string, name?, subject?, htmlBody?, textBody?, placeholders?, isActive? }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function toTemplate(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    htmlBody: row.html_body,
    textBody: row.text_body ?? null,
    placeholders: Array.isArray(row.placeholders) ? row.placeholders : [],
    isActive: Boolean(row.is_active ?? true),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
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

    if (req.method !== 'POST' && req.method !== 'PUT') {
      return new Response(
        JSON.stringify({ message: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = (await req.json()) as Record<string, unknown>
    const id = body?.id ? String(body.id) : ''

    if (!id) {
      return new Response(
        JSON.stringify({ message: 'id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    if (body?.name !== undefined) updates.name = String(body.name)
    if (body?.subject !== undefined) updates.subject = String(body.subject)
    if (body?.htmlBody !== undefined || body?.html_body !== undefined) {
      updates.html_body = String(body.htmlBody ?? body.html_body ?? '')
    }
    if (body?.textBody !== undefined || body?.text_body !== undefined) {
      updates.text_body = body.textBody ?? body.text_body ? String(body.textBody ?? body.text_body) : null
    }
    if (body?.placeholders !== undefined) updates.placeholders = body.placeholders
    if (body?.isActive !== undefined || body?.is_active !== undefined) {
      updates.is_active = Boolean(body.isActive ?? body.is_active)
    }

    const { data: row, error } = await supabase
      .from('notification_email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const r = (row ?? {}) as Record<string, unknown>
    return new Response(
      JSON.stringify({ data: toTemplate(r) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
