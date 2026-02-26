/**
 * Supabase Edge Function: studies-approve
 * Marks study as ready for export.
 * POST /functions/v1/studies-approve
 * Body: { studyId }
 * Returns: { study }
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

    const body = await req.json().catch(() => ({}))
    const studyId = (body?.studyId ?? '').toString()

    if (!studyId) {
      return new Response(
        JSON.stringify({ message: 'studyId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: study, error: updateErr } = await supabase
      .from('studies')
      .update({ status: 'ready', updated_at: new Date().toISOString() })
      .eq('id', studyId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateErr || !study) {
      return new Response(
        JSON.stringify({ message: 'Study not found or update failed' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        study: {
          id: study.id,
          user_id: study.user_id,
          topic: study.topic,
          status: study.status,
          created_at: study.created_at,
          updated_at: study.updated_at,
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
