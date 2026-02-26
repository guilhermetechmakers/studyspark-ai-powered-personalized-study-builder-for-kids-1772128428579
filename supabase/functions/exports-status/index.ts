/**
 * Supabase Edge Function: exports-status
 * Returns export job status and progress.
 * GET /functions/v1/exports-status?jobId=xxx
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
      .select('id, status, progress, result_url, error_message')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (error || !row) {
      return new Response(
        JSON.stringify({ message: 'Export not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        jobId: row.id,
        status: row.status,
        progress: typeof row.progress === 'number' ? row.progress : 0,
        resultUrl: row.result_url ?? null,
        error: row.error_message ?? undefined,
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
