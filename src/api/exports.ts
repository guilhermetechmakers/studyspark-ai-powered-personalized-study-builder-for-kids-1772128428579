/**
 * Export & Print-Ready Generation API
 * Uses Supabase Edge Functions for export workflow
 */

import type {
  CreateExportPayload,
  CreateExportResponse,
  ExportJobStatusResponse,
  ExportJobListItem,
  ExportTemplatesResponse,
} from '@/types/exports'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`
    }
  } catch {
    // ignore
  }
  return headers
}

/** POST /exports/create - Start an export job */
export async function createExport(
  payload: CreateExportPayload
): Promise<CreateExportResponse | null> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) return null

  const res = await fetch(`${supabaseUrl}/functions/v1/exports-create`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      studyId: payload.studyId,
      exportType: payload.exportType ?? 'pdf',
      paperSize: payload.paperSize ?? 'A4',
      orientation: payload.orientation ?? 'portrait',
      include: payload.include ?? {
        studySheet: true,
        flashcards: true,
        answers: true,
        notes: true,
      },
      watermark: payload.watermark ?? false,
      templateId: payload.templateId,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string })?.message ?? res.statusText)
  }

  const data = (await res.json()) as CreateExportResponse
  return data
}

/** GET /exports-status?jobId= - Get export job status */
export async function getExportStatus(
  jobId: string
): Promise<ExportJobStatusResponse | null> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) return null

  const res = await fetch(
    `${supabaseUrl}/functions/v1/exports-status?jobId=${encodeURIComponent(jobId)}`,
    { method: 'GET', headers }
  )

  if (!res.ok) return null

  const data = (await res.json()) as ExportJobStatusResponse
  return data
}

/** GET /exports-status - List export jobs via Supabase */
export async function listExports(
  limit = 20,
  offset = 0
): Promise<{ data: ExportJobListItem[]; count: number }> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) {
    return { data: [], count: 0 }
  }

  const { supabase } = await import('@/lib/supabase')
  const { data: rows, count } = await supabase
    .from('export_jobs')
    .select('id, study_id, export_type, status, progress, result_url, error_message, watermark_enabled, paper_size, orientation, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const items = Array.isArray(rows) ? rows : []
  const studyIds = [...new Set(items.map((r: Record<string, unknown>) => r.study_id).filter(Boolean))] as string[]
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

  const data: ExportJobListItem[] = items.map((row: Record<string, unknown>) => ({
    id: String(row.id ?? ''),
    studyId: row.study_id ? String(row.study_id) : '',
    exportType: (row.export_type as ExportJobListItem['exportType']) ?? 'pdf',
    status: (row.status as ExportJobListItem['status']) ?? 'queued',
    progress: typeof row.progress === 'number' ? row.progress : 0,
    resultUrl: row.result_url ? String(row.result_url) : null,
    error: row.error_message ? String(row.error_message) : null,
    watermarkEnabled: Boolean(row.watermark_enabled),
    paperSize: (row.paper_size as ExportJobListItem['paperSize']) ?? 'A4',
    orientation: (row.orientation as ExportJobListItem['orientation']) ?? 'portrait',
    createdAt: String(row.created_at ?? ''),
    studyTitle: studyTitles[String(row.study_id ?? '')] || `Export ${String(row.id ?? '').slice(0, 8)}`,
  }))

  return { data, count: count ?? data.length }
}

/** GET /exports-templates - Get available templates */
export async function listTemplates(): Promise<ExportTemplatesResponse['data']> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) {
    return []
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/templates-list`, {
    method: 'GET',
    headers,
  })

  if (!res.ok) {
    return []
  }

  const json = (await res.json()) as { data?: ExportTemplatesResponse['data'] }
  return Array.isArray(json?.data) ? json.data : []
}

/** Download export - fetch via resultUrl from job status */
export async function downloadExport(jobId: string): Promise<Blob> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) {
    throw new Error('Not authenticated')
  }

  const status = await getExportStatus(jobId)
  if (!status?.resultUrl) {
    throw new Error('Export not ready or expired')
  }

  const isSignedUrl = status.resultUrl.includes('/storage/') && status.resultUrl.includes('/sign/')
  const res = await fetch(status.resultUrl, {
    method: 'GET',
    headers: !isSignedUrl && headers.Authorization ? { Authorization: headers.Authorization } : {},
  })

  if (!res.ok) {
    throw new Error('Download failed')
  }

  return res.blob()
}
