/**
 * Supabase Edge Function: files-get
 * Returns file metadata and signed download URL.
 * GET /functions/v1/files-get?id={fileId}
 * Returns: { file, downloadUrl }
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

    const url = new URL(req.url)
    const fileId = url.searchParams.get('id') ?? ''

    if (!fileId) {
      return new Response(
        JSON.stringify({ message: 'id query parameter required' }),
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

    const { data: file, error } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('id', fileId)
      .single()

    if (error || !file) {
      return new Response(
        JSON.stringify({ message: 'File not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: signed } = await supabase.storage
      .from('file-uploads')
      .createSignedUrl(file.storage_key, 3600)

    const downloadUrl = signed?.signedUrl ?? null

    return new Response(
      JSON.stringify({
        file: {
          id: file.id,
          filename: file.filename,
          mimeType: file.mime_type,
          size: file.size,
          ocrStatus: file.ocr_status,
          ocrConfidence: file.ocr_confidence,
          ocrText: file.ocr_text,
          ocrVersion: file.ocr_version,
          relatedStudyId: file.related_study_id,
          tags: file.tags ?? [],
          createdAt: file.created_at,
          updatedAt: file.updated_at,
        },
        downloadUrl,
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
