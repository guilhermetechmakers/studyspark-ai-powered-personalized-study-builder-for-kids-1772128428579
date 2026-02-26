/**
 * Supabase Edge Function: exports-list
 * Returns list of export jobs for the current user.
 * GET /functions/v1/exports-list?limit=20&offset=0
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
    const url = new URL(req.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20', 10) || 20, 100)
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') ?? '0', 10))

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

    const { data: jobs } = await supabase
      .from('exports')
      .select('id, study_id, export_type, status, progress, result_url, watermark_enabled, paper_size, orientation, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const list = Array.isArray(jobs) ? jobs : []
    const studyIds = [...new Set(list.map((j: Record<string, unknown>) => j.study_id).filter(Boolean))]
    const studyTitles: Record<string, string> = {}
    if (studyIds.length > 0) {
      const { data: studies } = await supabase
        .from('studies')
        .select('id, title, topic')
        .in('id', studyIds)
      const studiesList = Array.isArray(studies) ? studies : []
      for (const s of studiesList) {
        const sid = (s as Record<string, unknown>).id as string
        studyTitles[sid] = String((s as Record<string, unknown>).title ?? (s as Record<string, unknown>).topic ?? '')
      }
    }

    const items = list.map((j: Record<string, unknown>) => ({
      id: j.id,
      studyId: j.study_id,
      exportType: j.export_type,
      status: j.status,
      progress: j.progress ?? 0,
      resultUrl: j.result_url ?? null,
      watermarkEnabled: j.watermark_enabled ?? false,
      paperSize: j.paper_size ?? 'A4',
      orientation: j.orientation ?? 'portrait',
      createdAt: j.created_at,
      studyTitle: studyTitles[(j.study_id as string) ?? ''] ?? '',
    }))

    return new Response(
      JSON.stringify({
        data: items,
        count: items.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message, data: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
