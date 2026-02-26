/**
 * Supabase Edge Function: files-complete-upload
 * Finalizes upload, runs virus scan (stub), triggers OCR processing.
 * POST /functions/v1/files-complete-upload
 * Body: { fileId }
 * Returns: { fileId, ocrStatus }
 *
 * Virus scanning: Stub - set to 'clean'. Integrate ClamAV when available.
 * OCR: Mock extraction. Integrate Google Cloud Vision via GOOGLE_CLOUD_VISION_API_KEY secret.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function mockOcrText(filename: string): string {
  return `Extracted content from ${filename}. This is sample OCR output. Key terms and definitions would appear here for AI context. In production, integrate Google Cloud Vision API for real OCR.`
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

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
    const fileId = String(body?.fileId ?? '').trim()

    if (!fileId) {
      return new Response(
        JSON.stringify({ message: 'fileId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: file, error: fetchErr } = await supabase
      .from('uploaded_files')
      .select('id, filename, owner_id, storage_key')
      .eq('id', fileId)
      .eq('owner_id', user.id)
      .single()

    if (fetchErr || !file) {
      return new Response(
        JSON.stringify({ message: 'File not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabase
      .from('uploaded_files')
      .update({
        ocr_status: 'in_progress',
        virus_scan_status: 'clean',
        updated_at: new Date().toISOString(),
      })
      .eq('id', fileId)
      .eq('owner_id', user.id)

    const ocrText = mockOcrText(file.filename ?? 'document')
    const blocks = ocrText.split(/(?<=[.!?])\s+/).filter(Boolean).map((text, i) => ({
      text,
      confidence: 0.85 + Math.random() * 0.15,
      index: i,
    }))

    const { error: ocrErr } = await supabase.from('ocr_results').upsert(
      {
        file_id: fileId,
        full_text: ocrText,
        language: 'en',
        blocks,
        words: [],
      },
      { onConflict: 'file_id' }
    )

    if (ocrErr) {
      await supabase
        .from('uploaded_files')
        .update({
          ocr_status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', fileId)
        .eq('owner_id', user.id)

      return new Response(
        JSON.stringify({ message: ocrErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const avgConfidence = blocks.length > 0
      ? blocks.reduce((a, b) => a + (b.confidence ?? 0), 0) / blocks.length
      : 0.9

    await supabase
      .from('uploaded_files')
      .update({
        ocr_status: 'completed',
        ocr_text: ocrText,
        ocr_confidence: avgConfidence,
        updated_at: new Date().toISOString(),
      })
      .eq('id', fileId)
      .eq('owner_id', user.id)

    await supabase.from('file_audit_logs').insert({
      file_id: fileId,
      action: 'ocr_complete',
      actor_id: user.id,
      details: { confidence: avgConfidence },
    })

    return new Response(
      JSON.stringify({
        fileId,
        ocrStatus: 'completed',
        ocrConfidence: avgConfidence,
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
