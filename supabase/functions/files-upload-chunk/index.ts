/**
 * Supabase Edge Function: files-upload-chunk
 * Receive a single chunk and store in Supabase Storage.
 * POST /functions/v1/files-upload-chunk (multipart/form-data)
 * Body: sessionId, chunkIndex, data (file)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BUCKET = 'file-uploads'

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

    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const formData = await req.formData().catch(() => null)
    if (!formData) {
      return new Response(
        JSON.stringify({ message: 'Invalid form data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sessionId = String(formData.get('sessionId') ?? '').trim()
    const chunkIndex = parseInt(String(formData.get('chunkIndex') ?? '-1'), 10)
    const data = formData.get('data')

    if (!sessionId || chunkIndex < 0 || !data) {
      return new Response(
        JSON.stringify({ message: 'sessionId, chunkIndex, and data are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: session, error: sessionErr } = await supabaseAdmin
      .from('upload_sessions')
      .select('id, file_id, chunk_count')
      .eq('id', sessionId)
      .eq('owner_id', user.id)
      .single()

    if (sessionErr || !session) {
      return new Response(
        JSON.stringify({ message: 'Invalid or expired session' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: fileRow } = await supabaseAdmin
      .from('uploaded_files')
      .select('storage_key')
      .eq('id', session.file_id)
      .single()

    const storageKey = fileRow?.storage_key ?? ''
    const chunkKey = `${storageKey}.chunk.${chunkIndex}`

    const blob = data instanceof Blob ? data : new Blob([data])
    const { error: uploadErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(chunkKey, blob, { upsert: true })

    if (uploadErr) {
      return new Response(
        JSON.stringify({ message: uploadErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: currentSession } = await supabaseAdmin
      .from('upload_sessions')
      .select('uploaded_chunks')
      .eq('id', sessionId)
      .single()
    const uploadedChunks = (currentSession?.uploaded_chunks ?? 0) + 1
    await supabaseAdmin
      .from('upload_sessions')
      .update({ uploaded_chunks: uploadedChunks })
      .eq('id', sessionId)

    return new Response(
      JSON.stringify({ ok: true, chunkIndex, uploadedChunks }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
