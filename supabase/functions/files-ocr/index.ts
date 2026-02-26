/**
 * Supabase Edge Function: files-ocr
 * Returns OCR results for a file.
 * GET /functions/v1/files-ocr?id={fileId}
 * Returns: { data: OcrResult }
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

    const { data: file } = await supabase
      .from('uploaded_files')
      .select('id')
      .eq('id', fileId)
      .single()

    if (!file) {
      return new Response(
        JSON.stringify({ message: 'File not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: ocr, error } = await supabase
      .from('ocr_results')
      .select('*')
      .eq('file_id', fileId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !ocr) {
      return new Response(
        JSON.stringify({ data: null, message: 'OCR results not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const blocks = Array.isArray(ocr.blocks) ? ocr.blocks : []
    const words = Array.isArray(ocr.words) ? ocr.words : []

    return new Response(
      JSON.stringify({
        data: {
          id: ocr.id,
          file_id: ocr.file_id,
          full_text: ocr.full_text ?? '',
          language: ocr.language,
          blocks,
          words,
          created_at: ocr.created_at,
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
