/**
 * Supabase Edge Function: exports-templates
 * Returns available export templates.
 * GET /functions/v1/exports-templates
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

    const { data: rows } = await supabase
      .from('export_templates')
      .select('id, name, type, paper_size, orientation, thumbnail_url')
      .order('name')

    const list = Array.isArray(rows) ? rows : []
    const items = list.map((r: Record<string, unknown>) => ({
      id: r.id,
      name: r.name ?? '',
      type: r.type ?? 'pdf',
      paperSize: r.paper_size ?? 'A4',
      orientation: r.orientation ?? 'portrait',
      thumbnail: r.thumbnail_url ?? null,
    }))

    return new Response(
      JSON.stringify({ data: items }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ data: [], message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
