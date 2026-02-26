/**
 * Supabase Edge Function: files-download-url
 * Returns a signed download URL for a file.
 * GET /functions/v1/files-download-url?id=<fileId>
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BUCKET = 'file-uploads'
const URL_EXPIRY_SEC = 3600

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ message: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user?.id) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const fileId = url.searchParams.get('id') ?? ''

    if (!fileId) {
      return new Response(
        JSON.stringify({ message: 'id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: file, error } = await supabase
      .from('uploaded_files')
      .select('storage_key, owner_id')
      .eq('id', fileId)
      .single()

    if (error || !file) {
      return new Response(
        JSON.stringify({ message: 'File not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const isOwner = file.owner_id === user.id
    const { data: shared } = await supabase
      .from('file_access_controls')
      .select('id')
      .eq('file_id', fileId)
      .eq('user_id', user.id)
      .single()

    if (!isOwner && !shared) {
      return new Response(
        JSON.stringify({ message: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: signedData, error: signError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(file.storage_key, URL_EXPIRY_SEC)

    if (signError || !signedData?.signedUrl) {
      return new Response(
        JSON.stringify({ message: signError?.message ?? 'Failed to create download URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ url: signedData.signedUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
