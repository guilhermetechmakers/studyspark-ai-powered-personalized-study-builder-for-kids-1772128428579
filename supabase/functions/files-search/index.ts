/**
 * Supabase Edge Function: files-search
 * Full-text search across uploaded files.
 * POST /functions/v1/files-search
 * Body: { query?, filters?: { ocr_status?, related_study_id? }, limit?, offset? }
 * Returns: { data: UploadedFile[], total: number }
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

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
    const query = String(body?.query ?? '').trim()
    const filters = (body?.filters ?? {}) as Record<string, unknown>
    const limit = Math.min(50, Math.max(1, Number(body?.limit ?? 20)))
    const offset = Math.max(0, Number(body?.offset ?? 0))

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

    if (query) {
      q = q.or(`filename.ilike.%${query}%,ocr_text.ilike.%${query}%`)
    }
    if (filters?.ocr_status) {
      q = q.eq('ocr_status', String(filters.ocr_status))
    }
    if (filters?.related_study_id) {
      q = q.eq('related_study_id', String(filters.related_study_id))
    }

    const { data: rows, error, count } = await q.range(offset, offset + limit - 1)

    if (error) {
      return new Response(
        JSON.stringify({ message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const list = Array.isArray(rows) ? rows : []

    return new Response(
      JSON.stringify({ data: list, total: count ?? list.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
