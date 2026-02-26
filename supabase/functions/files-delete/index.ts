/**
 * Supabase Edge Function: files-delete
 * Soft delete or hard delete a file (owner only).
 * DELETE /functions/v1/files-delete
 * Body: { fileId }
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

    const url = new URL(req.url)
    const fileId = url.searchParams.get('id') ?? ''

    if (!fileId) {
      return new Response(
        JSON.stringify({ message: 'fileId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: file } = await supabase
      .from('uploaded_files')
      .select('id, owner_id, storage_key')
      .eq('id', fileId)
      .eq('owner_id', user.id)
      .single()

    if (!file) {
      return new Response(
        JSON.stringify({ message: 'File not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabase.storage.from('file-uploads').remove([file.storage_key])
    await supabase.from('uploaded_files').delete().eq('id', fileId).eq('owner_id', user.id)

    await supabase.from('file_audit_logs').insert({
      file_id: fileId,
      action: 'deleted',
      actor_id: user.id,
      details: {},
    })

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
