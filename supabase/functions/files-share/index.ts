/**
 * Supabase Edge Function: files-share
 * Share a file with another user.
 * POST /functions/v1/files-share
 * Body: { fileId, userId, permission } or { file_id, user_id, permission }
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
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return new Response(
      JSON.stringify({ message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ message: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
    const fileId = String(body?.fileId ?? body?.file_id ?? '').trim()
    const userId = String(body?.userId ?? body?.user_id ?? '').trim()
    const permission = String(body?.permission ?? 'view').toLowerCase()

    if (!fileId || !userId) {
      return new Response(
        JSON.stringify({ message: 'fileId and userId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!['view', 'edit'].includes(permission)) {
      return new Response(
        JSON.stringify({ message: 'permission must be view or edit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    const { error: insertErr } = await supabase.from('file_access_controls').upsert(
      {
        file_id: fileId,
        user_id: userId,
        permission,
      },
      { onConflict: 'file_id,user_id' }
    )

    if (insertErr) {
      return new Response(
        JSON.stringify({ message: insertErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabase.from('file_audit_logs').insert({
      file_id: fileId,
      action: 'share',
      actor_id: user.id,
      details: { shared_with: userId, permission },
    })

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
