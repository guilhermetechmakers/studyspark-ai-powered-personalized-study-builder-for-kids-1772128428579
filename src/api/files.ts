/**
 * Files API - File Upload & OCR Ingestion.
 * Uses Supabase Edge Functions and Storage.
 * All responses validated with safe defaults; guards against null/undefined.
 */

import { supabase } from '@/lib/supabase'
import type {
  FileMeta,
  InitUploadResponse,
  CompleteUploadResponse,
  FileGetResponse,
  OcrResult,
  CorrectionsResponse,
  FilesSearchResponse,
} from '@/types/files'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''

function toFileMeta(row: Record<string, unknown>): FileMeta {
  return {
    id: String(row?.id ?? ''),
    filename: String(row?.filename ?? ''),
    mimeType: String(row?.mime_type ?? row?.mimeType ?? ''),
    size: Number(row?.size ?? 0),
    ocrStatus: (row?.ocr_status ?? row?.ocrStatus ?? 'pending') as FileMeta['ocrStatus'],
    ocrConfidence: (() => {
      const v = row?.ocr_confidence ?? row?.ocrConfidence
      return typeof v === 'number' && !Number.isNaN(v) ? v : null
    })(),
    ocrText: (() => {
      const v = row?.ocr_text ?? row?.ocrText
      return typeof v === 'string' ? v : null
    })(),
    ocrVersion: Number(row?.ocr_version ?? row?.ocrVersion ?? 1),
    relatedStudyId: (() => {
      const v = row?.related_study_id ?? row?.relatedStudyId
      return typeof v === 'string' ? v : null
    })(),
    tags: Array.isArray(row?.tags) ? row.tags : [],
    createdAt: String(row?.created_at ?? row?.createdAt ?? ''),
    updatedAt: String(row?.updated_at ?? row?.updatedAt ?? ''),
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`
  }
  return headers
}

/** Init upload - creates file record, returns storage path */
export async function initUpload(payload: {
  filename: string
  mimeType: string
  size: number
  relatedStudyId?: string | null
  childProfileId?: string | null
  subject?: string
}): Promise<InitUploadResponse> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${supabaseUrl}/functions/v1/files-init-upload`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(err?.message ?? res.statusText)
  }
  const data = (await res.json()) as InitUploadResponse & { storagePath?: string }
  return {
    fileId: data?.fileId ?? '',
    storagePath: data?.storagePath ?? '',
    filename: data?.filename ?? payload.filename,
  }
}

/** Upload file to Supabase Storage */
export async function uploadToStorage(
  storagePath: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> {
  const bucket = 'file-uploads'
  const { error } = await supabase.storage.from(bucket).upload(storagePath, file, {
    cacheControl: '3600',
    upsert: true,
  })
  if (error) throw error
  onProgress?.(100)
}

/** Complete upload - triggers OCR */
export async function completeUpload(fileId: string): Promise<CompleteUploadResponse> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${supabaseUrl}/functions/v1/files-complete-upload`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ fileId }),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(err?.message ?? res.statusText)
  }
  const data = (await res.json()) as CompleteUploadResponse
  return {
    fileId: data?.fileId ?? fileId,
    ocrStatus: data?.ocrStatus ?? 'completed',
    ocrConfidence: data?.ocrConfidence,
  }
}

/** Get signed download URL for a file (via files-get) */
export async function getDownloadUrl(fileId: string): Promise<string | null> {
  try {
    const res = await getFile(fileId)
    return res?.downloadUrl ?? null
  } catch {
    return null
  }
}

/** Get file metadata and download URL */
export async function getFile(fileId: string): Promise<FileGetResponse> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${supabaseUrl}/functions/v1/files-get?id=${encodeURIComponent(fileId)}`, {
    method: 'GET',
    headers,
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(err?.message ?? res.statusText)
  }
  const data = (await res.json()) as FileGetResponse
  return {
    file: data?.file ?? ({} as FileMeta),
    downloadUrl: data?.downloadUrl ?? null,
  }
}

/** Get OCR results */
export async function getOcr(fileId: string): Promise<OcrResult | null> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${supabaseUrl}/functions/v1/files-ocr?id=${encodeURIComponent(fileId)}`, {
    method: 'GET',
    headers,
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(err?.message ?? res.statusText)
  }
  const json = (await res.json()) as { data?: OcrResult | null }
  const data = json?.data
  if (!data) return null
  const blocks = Array.isArray(data.blocks) ? data.blocks : []
  return {
    ...data,
    blocks,
    fullText: data.fullText ?? (data as { full_text?: string }).full_text ?? null,
    language: data.language ?? null,
  }
}

/** Get OCR results - alias for getOcr */
export const getOcrResults = getOcr

/** Save OCR corrections */
export async function saveCorrections(
  fileId: string,
  correctedText: string,
  version: number = 1
): Promise<{ ok: boolean; error?: string; fileId?: string; version?: number }> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${supabaseUrl}/functions/v1/files-corrections`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      file_id: fileId,
      fileId,
      corrected_text: correctedText,
      correctedText,
      version,
    }),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string }
    return { ok: false, error: err?.message ?? res.statusText }
  }
  const data = (await res.json()) as CorrectionsResponse & { ok?: boolean }
  return {
    ok: true,
    fileId: data?.fileId ?? fileId,
    version: data?.version ?? version,
  }
}

/** List files */
export async function listFiles(params?: {
  limit?: number
  offset?: number
  ocrStatus?: string
  relatedStudyId?: string
}): Promise<FilesSearchResponse> {
  const headers = await getAuthHeaders()
  const qs = new URLSearchParams()
  if (params?.limit != null) qs.set('limit', String(params.limit))
  if (params?.offset != null) qs.set('offset', String(params.offset))
  if (params?.ocrStatus) qs.set('ocr_status', params.ocrStatus)
  if (params?.relatedStudyId) qs.set('related_study_id', params.relatedStudyId)
  const res = await fetch(`${supabaseUrl}/functions/v1/files-list?${qs.toString()}`, {
    method: 'GET',
    headers,
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(err?.message ?? res.statusText)
  }
  const data = (await res.json()) as { data?: unknown[]; count?: number }
  const raw = Array.isArray(data?.data) ? data.data : []
  const items = raw.map((r) => toFileMeta(r as Record<string, unknown>))
  return {
    data: items,
    count: data?.count ?? items.length,
  }
}

/** Search files */
export async function searchFiles(params: {
  query?: string
  filters?: { ocr_status?: string; related_study_id?: string }
  ocrStatus?: string
  relatedStudyId?: string
  limit?: number
  offset?: number
}): Promise<FilesSearchResponse> {
  const headers = await getAuthHeaders()
  const qs = new URLSearchParams()
  if (params.query) qs.set('q', params.query)
  if (params.limit != null) qs.set('limit', String(params.limit))
  if (params.offset != null) qs.set('offset', String(params.offset))
  const ocrStatus = params.filters?.ocr_status ?? params.ocrStatus
  const relatedStudyId = params.filters?.related_study_id ?? params.relatedStudyId
  if (ocrStatus) qs.set('ocr_status', ocrStatus)
  if (relatedStudyId) qs.set('related_study_id', relatedStudyId)
  const url = `${supabaseUrl}/functions/v1/files-search?${qs.toString()}`
  const res = await fetch(url, {
    method: 'GET',
    headers,
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(err?.message ?? res.statusText)
  }
  const data = (await res.json()) as { data?: unknown[]; count?: number; total?: number }
  const raw = Array.isArray(data?.data) ? data.data : []
  const items = raw.map((r) => toFileMeta(r as Record<string, unknown>))
  return {
    data: items,
    count: data?.count ?? data?.total ?? items.length,
  }
}

/** Direct upload when Edge Function unavailable - upload to Storage and create record */
export async function uploadFileDirect(
  file: File,
  relatedStudyId?: string | null
): Promise<{ fileId?: string; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const ext = file.name.split('.').pop() ?? 'bin'
  const storagePath = `${user.id}/${crypto.randomUUID()}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from('file-uploads')
    .upload(storagePath, file, { contentType: file.type, upsert: false })

  if (uploadErr) return { error: uploadErr.message }

  const { data: fileRow, error: insertErr } = await supabase
    .from('uploaded_files')
    .insert({
      owner_id: user.id,
      filename: file.name,
      mime_type: file.type,
      size: file.size,
      storage_key: storagePath,
      ocr_status: 'pending',
      virus_scan_status: 'clean',
      related_study_id: relatedStudyId ?? null,
    })
    .select('id')
    .single()

  if (insertErr) return { error: insertErr.message }
  return { fileId: fileRow?.id ?? undefined }
}

/** Delete file */
export async function deleteFile(fileId: string): Promise<{ ok: boolean; error?: string }> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${supabaseUrl}/functions/v1/files-delete?id=${encodeURIComponent(fileId)}`, {
    method: 'DELETE',
    headers,
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string }
    return { ok: false, error: err?.message ?? res.statusText }
  }
  return { ok: true }
}

/** Share file with user */
export async function shareFile(
  fileId: string,
  userId: string,
  permission: 'view' | 'edit' = 'view'
): Promise<void> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${supabaseUrl}/functions/v1/files-share`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ fileId, userId, permission }),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(err?.message ?? res.statusText)
  }
}
