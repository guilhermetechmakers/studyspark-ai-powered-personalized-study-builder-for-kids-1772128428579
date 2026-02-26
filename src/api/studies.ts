/**
 * Studies API - AI Generation Engine (Study Builder).
 * Uses Supabase Edge Functions for create, prepare, generate (streaming), revise, versions, approve, export.
 * All responses validated with safe defaults; guards against null/undefined.
 */

import { supabase } from '@/lib/supabase'
import type {
  Material,
  Version,
  Revision,
  AIOutputBlock,
} from '@/types/study-wizard'
import type { PrepareStudyRequest, PrepareStudyResponse, VersionMetadata, VersionDetail } from '@/types/study-builder'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''

export interface PreparePayload {
  topic: string
  subject?: string
  contextNotes?: string
  examDate?: string
  childProfileId?: string
  learningStyle?: string
  materialUrls?: string[]
}

export interface PrepareResponse {
  draftContext: Record<string, unknown>
  ready: boolean
}

export interface CreateStudyPayload {
  topic: string
  subject?: string
  contextNotes?: string
  examDate?: string
  childProfileId?: string
  learningStyle?: string
  age?: number
  generationOptions?: { depth?: string; outputs?: string[]; curriculumAligned?: boolean }
  materialUrls?: string[]
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`
  }
  return headers
}

/** Creates study via studies-create Edge Function */
export async function createStudy(payload: CreateStudyPayload): Promise<{ studyId: string }> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${supabaseUrl}/functions/v1/studies-create`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? res.statusText)
  }
  const data = (await res.json()) as { studyId?: string }
  return { studyId: data.studyId ?? '' }
}

/** Uses studies-prepare Edge Function: creates study, returns context */
export async function prepareStudy(payload: PrepareStudyRequest): Promise<PrepareStudyResponse | null> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${supabaseUrl}/functions/v1/studies-prepare`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      topic: payload.topic,
      subject: payload.subject,
      contextNotes: payload.contextNotes,
      childProfile: payload.childProfile,
      childProfileId: payload.childProfile?.id,
      childAge: payload.childProfile?.age,
      learningStyle: payload.learningStyle ?? 'playful',
      materials: payload.uploadedMaterials ?? [],
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? res.statusText)
  }
  const data = (await res.json()) as { studyId?: string; contextBlocks?: { id: string; type: string; content: string }[]; topicTags?: string[] }
  return {
    studyId: data.studyId ?? '',
    contextBlocks: data.contextBlocks ?? [],
    topicTags: data.topicTags ?? [],
  }
}

export async function startGeneration(payload: { studyId: string }): Promise<void> {
  const { error } = await supabase.functions.invoke('studies-generate', { body: payload })
  if (error) throw error
}

export interface StreamStudyCallbacks {
  onBlock: (block: AIOutputBlock) => void
  onProgress: (pct: number) => void
  onComplete: () => void
  onError: (err: Error) => void
}

export async function streamStudyGeneration(
  studyId: string,
  callbacks: StreamStudyCallbacks,
  _signal?: AbortSignal
): Promise<void> {
  for await (const event of streamGeneration(studyId)) {
    if (event.type === 'block') callbacks.onBlock(event.block)
    else if (event.type === 'progress') callbacks.onProgress(event.progressPct)
    else if (event.type === 'done') {
      callbacks.onComplete()
      return
    }
    else if (event.type === 'error') {
      callbacks.onError(new Error(event.message))
      return
    }
  }
}

export async function reviseStudy(
  studyId: string,
  comments: string
): Promise<{ blocks?: AIOutputBlock[] } | null> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${supabaseUrl}/functions/v1/studies-revise`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ studyId, prompt: comments, revisionPrompt: comments, comments }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? res.statusText)
  }
  const data = (await res.json()) as { draft?: { content_payload?: { blocks?: AIOutputBlock[]; lessons?: Array<{ type?: string; content?: string; order?: number }> } } }
  const payload = data?.draft?.content_payload
  const rawBlocks = Array.isArray(payload?.blocks) ? payload.blocks : undefined
  const lessons = Array.isArray(payload?.lessons) ? payload.lessons : []
  const blocks = rawBlocks ?? lessons.map((l, i) => ({
    type: (l.type as AIOutputBlock['type']) ?? 'text',
    content: l.content ?? '',
    order: l.order ?? i,
  }))
  return blocks.length > 0 ? { blocks } : null
}

export async function fetchStudyVersions(studyId: string): Promise<VersionMetadata[]> {
  const headers = await getAuthHeaders()
  const res = await fetch(
    `${supabaseUrl}/functions/v1/studies-versions?studyId=${encodeURIComponent(studyId)}`,
    { method: 'GET', headers }
  )
  if (!res.ok) return []
  const data = (await res.json()) as { versions?: Array<{ id?: string; studyId?: string; versionNumber?: number; createdAt?: string }> }
  const list = Array.isArray(data?.versions) ? data.versions : []
  return list.map((v) => ({
    id: v.id ?? '',
    studyId: v.studyId ?? studyId,
    versionNumber: v.versionNumber ?? 0,
    createdAt: v.createdAt ?? new Date().toISOString(),
  }))
}


export async function* streamGeneration(studyId: string): AsyncGenerator<
  { type: 'block'; block: AIOutputBlock } | { type: 'progress'; progressPct: number } | { type: 'done' } | { type: 'error'; message: string },
  void,
  unknown
> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${supabaseUrl}/functions/v1/studies-generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ studyId }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    yield { type: 'error', message: (err as { message?: string }).message ?? res.statusText }
    return
  }

  const reader = res.body?.getReader()
  if (!reader) {
    yield { type: 'error', message: 'Stream unavailable' }
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const json = JSON.parse(line.slice(6)) as Record<string, unknown>
            if (json.type === 'error' && typeof json.error === 'string') {
              yield { type: 'error', message: json.error }
              return
            }
            if (json.type === 'block' && json.block && typeof json.block === 'object') {
              const b = json.block as Record<string, unknown>
              yield {
                type: 'block',
                block: {
                  type: (b.type as 'text' | 'list' | 'table' | 'image') ?? 'text',
                  content: String(b.content ?? ''),
                  order: typeof b.order === 'number' ? b.order : 0,
                },
              }
            }
            if (json.type === 'progress' && typeof json.progressPct === 'number') {
              yield { type: 'progress', progressPct: json.progressPct }
            }
            if (json.type === 'complete') {
              yield { type: 'done' }
              return
            }
          } catch {
            // skip invalid JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export async function submitRevision(
  studyId: string,
  comments: string
): Promise<Revision> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${supabaseUrl}/functions/v1/studies-revise`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ studyId, comments }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? res.statusText)
  }
  return {
    id: `rev-${Date.now()}`,
    studyId,
    comments,
    status: 'closed',
    createdAt: new Date().toISOString(),
  }
}

export async function createVersion(studyId: string): Promise<Version> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${supabaseUrl}/functions/v1/studies-versions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ studyId }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? res.statusText)
  }
  const data = (await res.json()) as { id?: string; studyId?: string; versionNumber?: number; createdAt?: string }
  return {
    id: data.id ?? `v-${Date.now()}`,
    studyId: data.studyId ?? studyId,
    snapshot: {},
    createdAt: data.createdAt ?? new Date().toISOString(),
  }
}

export async function fetchVersionHistory(studyId: string): Promise<Version[]> {
  const headers = await getAuthHeaders()
  const res = await fetch(
    `${supabaseUrl}/functions/v1/studies-versions?studyId=${encodeURIComponent(studyId)}`,
    { method: 'GET', headers }
  )
  if (!res.ok) return []
  const data = (await res.json()) as { versions?: Array<{ id?: string; studyId?: string; createdAt?: string }> }
  const list = Array.isArray(data?.versions) ? data.versions : []
  return list.map((v) => ({
    id: v.id ?? '',
    studyId: v.studyId ?? studyId,
    snapshot: {},
    createdAt: v.createdAt ?? new Date().toISOString(),
  }))
}

export async function fetchVersion(studyId: string, versionId: string): Promise<VersionDetail | null> {
  const headers = await getAuthHeaders()
  const res = await fetch(
    `${supabaseUrl}/functions/v1/studies-versions?studyId=${encodeURIComponent(studyId)}&versionId=${encodeURIComponent(versionId)}`,
    { method: 'GET', headers }
  )
  if (!res.ok) return null
  const data = (await res.json()) as { contentSnapshot?: { blocks?: AIOutputBlock[] }; versionNumber?: number; createdAt?: string }
  return {
    id: versionId,
    studyId,
    versionNumber: data.versionNumber ?? 0,
    contentSnapshot: data.contentSnapshot ?? {},
    createdAt: data.createdAt ?? new Date().toISOString(),
  }
}

export async function approveStudy(studyId: string): Promise<{ studyId: string; status: string }> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${supabaseUrl}/functions/v1/studies-approve`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ studyId }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? res.statusText)
  }
  return res.json()
}

export async function exportStudy(
  studyId: string,
  format: 'pdf' | 'json' | 'html'
): Promise<Blob | Record<string, unknown> | { url: string }> {
  const headers = await getAuthHeaders()
  const fmt = format === 'pdf' ? 'html' : format
  const res = await fetch(
    `${supabaseUrl}/functions/v1/studies-export?studyId=${encodeURIComponent(studyId)}&format=${fmt}`,
    { method: 'GET', headers }
  )
  if (!res.ok) throw new Error('Export failed')
  if (fmt === 'json') return res.json() as Promise<Record<string, unknown>>
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  return { url }
}

export async function fetchMaterials(studyId: string): Promise<Material[]> {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('study_id', studyId)
  if (error) return []
  const rows = Array.isArray(data) ? data : []
  return rows.map((r: Record<string, unknown>) => ({
    id: String(r.id ?? ''),
    studyId,
    name: String(r.name ?? 'Material'),
    url: String(r.source_url ?? ''),
    type: (r.type as 'document' | 'photo') ?? 'document',
    uploadedAt: String(r.created_at ?? ''),
  }))
}
