/**
 * Supabase Edge Function: exports-download
 * Returns the export file (HTML) for download.
 * GET /functions/v1/exports-download?jobId=xxx
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
    const jobId = url.searchParams.get('jobId') ?? ''

    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !jobId) {
      return new Response(
        JSON.stringify({ message: 'Missing authorization or jobId' }),
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

    const { data: row, error } = await supabase
      .from('exports')
      .select('id, result_data, result_url, status, study_id')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (error || !row) {
      return new Response(
        JSON.stringify({ message: 'Export not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (row.status !== 'completed') {
      return new Response(
        JSON.stringify({ message: 'Export not ready' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const html = row.result_data ?? ''
    const safeName = 'study-export'
    const filename = `${safeName}_${jobId.slice(0, 8)}.html`

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
