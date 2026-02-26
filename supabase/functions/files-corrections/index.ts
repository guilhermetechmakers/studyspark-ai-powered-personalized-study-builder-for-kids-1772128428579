/**
 * Supabase Edge Function: files-corrections
 * Save OCR corrections as a new file version.
 * POST /functions/v1/files-corrections
 * Body: { fileId, correctedText, version } or { file_id, corrected_text, version }
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
    const fileId = String(body?.fileId ?? body?.file_id ?? '').trim()
    const correctedText = String(body?.correctedText ?? body?.corrected_text ?? '')
    const version = Math.max(1, Number(body?.version ?? 1))

    if (!fileId) {
      return new Response(
        JSON.stringify({ message: 'fileId required' }),
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

    const { data: file, error: fetchErr } = await supabase
      .from('uploaded_files')
      .select('id')
      .eq('id', fileId)
      .single()

    if (fetchErr || !file) {
      return new Response(
        JSON.stringify({ message: 'File not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error: versionErr } = await supabase.from('file_versions').insert({
      file_id: fileId,
      version,
      ocr_text: correctedText,
      created_by: user.id,
    })

    if (versionErr) {
      return new Response(
        JSON.stringify({ message: versionErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabase
      .from('uploaded_files')
      .update({
        ocr_text: correctedText,
        ocr_version: version,
        ocr_status: 'corrected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', fileId)

    await supabase.from('file_audit_logs').insert({
      file_id: fileId,
      action: 'correction_saved',
      actor_id: user.id,
      details: { version },
    })

    return new Response(
      JSON.stringify({ ok: true, version }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
