/**
 * Supabase Edge Function: notifications-email-templates
 * List and create email templates. Admin-only for create.
 * GET /functions/v1/notifications-email-templates - list
 * POST /functions/v1/notifications-email-templates - create
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

    if (req.method === 'GET') {
      const { data: rows, error } = await supabase
        .from('notification_email_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return new Response(
          JSON.stringify({ message: error.message, data: [] }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const list = Array.isArray(rows) ? rows : []
      const data = list.map((r: Record<string, unknown>) => toTemplate(r))

      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const body = (await req.json()) as Record<string, unknown>
      const name = body?.name ? String(body.name) : ''
      const subject = body?.subject ? String(body.subject) : ''
      const htmlBody = body?.htmlBody ?? body?.html_body
      const html = htmlBody ? String(htmlBody) : ''
      const textBody = body?.textBody ?? body?.text_body
      const text = textBody ? String(textBody) : null
      const placeholders = Array.isArray(body?.placeholders) ? body.placeholders : []
      const isActive = body?.isActive ?? body?.is_active ?? true

      if (!name || !subject || !html) {
        return new Response(
          JSON.stringify({ message: 'name, subject, and htmlBody are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: row, error } = await supabase
        .from('notification_email_templates')
        .insert({
          name,
          subject,
          html_body: html,
          text_body: text,
          placeholders,
          is_active: Boolean(isActive),
          updated_at: new Date().toISOString(),
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
      return new Response(
        JSON.stringify({ data: toTemplate(r) }),
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
