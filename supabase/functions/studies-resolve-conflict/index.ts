/**
 * Supabase Edge Function: studies-resolve-conflict
 * Resolves concurrent edit conflicts.
 * POST /functions/v1/studies-resolve-conflict
 * Body: { studyId, conflictId, resolutionStrategy: 'keep_local'|'keep_remote'|'merge' }
 * Returns: { ok: boolean }
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
    const conflictId = (body?.conflictId ?? '').toString()
    const resolutionStrategy = (body?.resolutionStrategy ?? 'keep_local').toString()

    if (!studyId || !conflictId) {
      return new Response(
        JSON.stringify({ message: 'studyId and conflictId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: study } = await supabase
      .from('studies')
      .select('id')
      .eq('id', studyId)
      .eq('user_id', user.id)
      .single()

    if (!study) {
      return new Response(
        JSON.stringify({ message: 'Study not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: conflict } = await supabase
      .from('conflict_logs')
      .select('*')
      .eq('study_id', studyId)
      .eq('id', conflictId)
      .single()

    if (!conflict) {
      return new Response(
        JSON.stringify({ message: 'Conflict not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabase
      .from('conflict_logs')
      .update({
        resolved_at: new Date().toISOString(),
        resolution_strategy: resolutionStrategy,
      })
      .eq('id', conflictId)
      .eq('study_id', studyId)

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
