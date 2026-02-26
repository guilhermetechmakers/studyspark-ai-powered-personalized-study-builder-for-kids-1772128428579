/**
 * Supabase Edge Function: files-list
 * List uploaded files for the current user with optional filters.
 * GET /functions/v1/files-list?limit=&offset=&ocr_status=&related_study_id=
 * Returns: { data: UploadedFile[], count: number }
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
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20', 10)))
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') ?? '0', 10))
    const ocrStatus = url.searchParams.get('ocr_status')?.trim() || undefined
    const relatedStudyId = url.searchParams.get('related_study_id')?.trim() || undefined

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

    let q = supabase
      .from('uploaded_files')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (ocrStatus) q = q.eq('ocr_status', ocrStatus)
    if (relatedStudyId) q = q.eq('related_study_id', relatedStudyId)

    const { data: rows, error, count } = await q.range(offset, offset + limit - 1)

    if (error) {
      return new Response(
        JSON.stringify({ message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const list = Array.isArray(rows) ? rows : []

    return new Response(
      JSON.stringify({ data: list, count: count ?? list.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
