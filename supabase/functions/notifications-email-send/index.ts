/**
 * Supabase Edge Function: notifications-email-send
 * Send transactional/marketing email with template. Test send for admin.
 * POST /functions/v1/notifications-email-send
 * Body: { templateId: string, to: string[], substitutions?: Record<string, string> }
 * Note: Actual SendGrid/Mailgun integration requires secrets. This stub logs and returns success.
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

    const body = (await req.json()) as Record<string, unknown>
    const templateId = body?.templateId ? String(body.templateId) : ''
    const to = Array.isArray(body?.to) ? (body.to as string[]) : []

    if (!templateId || to.length === 0) {
      return new Response(
        JSON.stringify({ message: 'templateId and to (array) are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: template, error: templateError } = await supabase
      .from('notification_email_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (templateError || !template) {
      return new Response(
        JSON.stringify({ message: 'Template not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const t = template as Record<string, unknown>
    const subject = String(t.subject ?? '')
    const htmlBody = String(t.html_body ?? '')
    const substitutions = (body?.substitutions as Record<string, string>) ?? {}

    let renderedHtml = htmlBody
    for (const [key, value] of Object.entries(substitutions)) {
      renderedHtml = renderedHtml.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }

    const sendGridKey = Deno.env.get('SENDGRID_API_KEY')
    if (sendGridKey) {
      const emailRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sendGridKey}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: to.map((email) => ({ email })) }],
          from: { email: Deno.env.get('SENDGRID_FROM_EMAIL') ?? 'noreply@studyspark.com', name: 'StudySpark' },
          subject,
          content: [{ type: 'text/html', value: renderedHtml }],
        }),
      })

      if (!emailRes.ok) {
        const errText = await emailRes.text()
        return new Response(
          JSON.stringify({ message: 'Email send failed', details: errText }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    await supabase.from('notification_email_logs').insert({
      user_id: user.id,
      template_id: templateId,
      status: 'sent',
      message_id: `test-${Date.now()}`,
    })

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
