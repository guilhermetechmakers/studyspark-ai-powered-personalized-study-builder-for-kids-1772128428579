/**
 * Supabase Edge Function: studies-version-detail
 * Fetches version data and diffs.
 * POST /functions/v1/studies-version-detail
 * Body: { studyId: string, versionId: string }
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
    const token = authHeader?.replace('Bearer ', '') ?? ''
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const userClient = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { user } } = await userClient.auth.getUser(token)
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = (await req.json().catch(() => ({}))) as { studyId?: string; versionId?: string }
    const studyId = (body.studyId ?? '').toString().trim()
    const versionId = (body.versionId ?? '').toString().trim()

    if (!studyId || !versionId) {
      return new Response(
        JSON.stringify({ error: 'studyId and versionId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey)
    const { data: study } = await adminClient.from('studies').select('id, user_id').eq('id', studyId).single()

    if (!study || (study.user_id as string) !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Study not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: version } = await adminClient
      .from('versions')
      .select('*')
      .eq('id', versionId)
      .eq('study_id', studyId)
      .single()

    if (!version) {
      return new Response(
        JSON.stringify({ error: 'Version not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const contentSnapshot = (version.content_snapshot as Record<string, unknown>) ?? {}
    const diffs = (version.diffs as Record<string, unknown>) ?? {}

    return new Response(
      JSON.stringify({
        id: version.id,
        studyId: version.study_id,
        versionNumber: version.version_number,
        contentSnapshot,
        diffs,
        createdAt: version.created_at,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
