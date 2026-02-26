/**
 * Supabase Edge Function: files-init-upload
 * Creates file record and returns upload path for client to upload to Supabase Storage.
 * POST /functions/v1/files-init-upload
 * Body: { filename, mimeType, size, relatedStudyId?, childProfileId?, subject? }
 * Returns: { fileId, storagePath, uploadUrl }
 *
 * Client uploads file to Supabase Storage using supabase.storage.from('file-uploads').upload(storagePath, file)
 * Then calls files-complete-upload to finalize and trigger OCR.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const MAX_SIZE = 25 * 1024 * 1024 // 25MB

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
    const filename = String(body?.filename ?? '').trim()
    const mimeType = String(body?.mimeType ?? '').trim()
    const size = Number(body?.size ?? 0)

    if (!filename || !mimeType) {
      return new Response(
        JSON.stringify({ message: 'filename and mimeType required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!ALLOWED_MIME.includes(mimeType)) {
      return new Response(
        JSON.stringify({ message: 'Unsupported file type. Use JPG, PNG, PDF, or DOCX.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (size <= 0 || size > MAX_SIZE) {
      return new Response(
        JSON.stringify({ message: 'File size must be between 1 byte and 25MB' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const fileId = crypto.randomUUID()
    const storagePath = `${user.id}/${fileId}/${safeName}`

    const { data: fileRow, error } = await supabase
      .from('uploaded_files')
      .insert({
        id: fileId,
        owner_id: user.id,
        filename: safeName,
        mime_type: mimeType,
        size,
        storage_key: storagePath,
        ocr_status: 'pending',
        virus_scan_status: 'pending',
        related_study_id: body?.relatedStudyId ?? null,
        child_profile_id: body?.childProfileId ?? null,
        subject: String(body?.subject ?? ''),
      })
      .select('id')
      .single()

    if (error || !fileRow) {
      return new Response(
        JSON.stringify({ message: error?.message ?? 'Failed to create file record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabase.from('file_audit_logs').insert({
      file_id: fileId,
      action: 'upload_init',
      actor_id: user.id,
      details: { filename: safeName, size },
    })

    return new Response(
      JSON.stringify({
        fileId: fileRow.id,
        storagePath,
        filename: safeName,
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
