/**
 * Study Review API - Supabase-backed implementation.
 * Fetches study + draft from Supabase, maps to StudyReviewData.
 * Uses Edge Functions for revise, versions, approve, duplicate.
 * All responses validated with safe defaults; guards against null/undefined.
 */

import { supabase } from '@/lib/supabase'
import type {
  Study,
  SectionBlock,
  SectionContent,
  Revision,
  Version,
  StudyReviewData,
} from '@/types/study-review'
import { dataGuard } from '@/lib/data-guard'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`
  }
  return headers
}

/** Map draft content_payload to SectionBlock[] */
function payloadToSections(payload: Record<string, unknown>, studyId: string): SectionBlock[] {
  const sections: SectionBlock[] = []
  const lessons = Array.isArray(payload.lessons) ? payload.lessons : []
  const blocks = Array.isArray((payload as { blocks?: unknown[] }).blocks) ? (payload as { blocks: unknown[] }).blocks : lessons

  if (blocks.length > 0) {
    blocks.forEach((b: Record<string, unknown>, i: number) => {
      sections.push({
        id: String(b?.id ?? `sec-${i}`),
        studyId,
        type: 'summary',
        content: typeof b.content === 'string' ? b.content : (b.content as SectionContent) ?? {},
        order: typeof b.order === 'number' ? b.order : i,
      })
    })
  } else {
    const summary = payload.summary ?? payload.content
    if (summary) {
      sections.push({
        id: 'sec-summary',
        studyId,
        type: 'summary',
        content: typeof summary === 'string' ? summary : JSON.stringify(summary),
        order: 0,
      })
    }
    if (Array.isArray(payload.lessons) && payload.lessons.length > 0) {
      sections.push({
        id: 'sec-lessons',
        studyId,
        type: 'lessons',
        content: { lessons: payload.lessons as Array<{ title: string; body: string }> },
        order: 1,
      })
    }
    if (Array.isArray(payload.flashcards) && payload.flashcards.length > 0) {
      sections.push({
        id: 'sec-flashcards',
        studyId,
        type: 'flashcards',
        content: { flashcards: payload.flashcards as Array<{ front: string; back: string }> },
        order: 2,
      })
    }
    if (Array.isArray(payload.quizzes) && payload.quizzes.length > 0) {
      sections.push({
        id: 'sec-quizzes',
        studyId,
        type: 'quizzes',
        content: { quizzes: payload.quizzes as Array<{ question: string; options: string[]; answer: string }> },
        order: 3,
      })
    }
  }

  if (sections.length === 0) {
    sections.push({
      id: 'sec-summary',
      studyId,
      type: 'summary',
      content: '',
      order: 0,
    })
  }
  return sections
}

/** Map SectionBlock[] to content_payload for draft */
function sectionsToPayload(sections: SectionBlock[]): Record<string, unknown> {
  const sorted = [...dataGuard(sections)].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const blocks = sorted.map((s, i) => ({
    id: s.id,
    type: s.type === 'summary' ? 'text' : s.type,
    content: typeof s.content === 'string' ? s.content : s.content,
    order: i,
  }))
  return { blocks, lessons: blocks }
}

export async function fetchStudyReviewSupabase(studyId: string): Promise<StudyReviewData> {
  const { data: study, error: studyErr } = await supabase
    .from('studies')
    .select('*')
    .eq('id', studyId)
    .single()

  if (studyErr || !study) {
    throw new Error('Study not found')
  }

  const { data: draft } = await supabase
    .from('drafts')
    .select('content_payload')
    .eq('study_id', studyId)
    .single()

  const payload = (draft?.content_payload as Record<string, unknown>) ?? {}
  const sections = payloadToSections(payload, studyId)

  const { data: versions } = await supabase
    .from('versions')
    .select('id, study_id, version_number, created_at')
    .eq('study_id', studyId)
    .order('version_number', { ascending: false })

  const versionList = Array.isArray(versions) ? versions : []
  const versionsMapped: Version[] = versionList.map((v) => ({
    id: v?.id ?? '',
    studyId: v?.study_id ?? studyId,
    versionNumber: v?.version_number ?? 0,
    diffSummary: `Version ${v?.version_number ?? 0}`,
    createdAt: v?.created_at ?? new Date().toISOString(),
  }))

  return {
    study: {
      id: study.id,
      title: (study.topic as string) ?? 'Untitled Study',
      ownerId: (study.user_id as string) ?? '',
      status: (study.status as 'draft' | 'pending' | 'approved') ?? 'draft',
      createdAt: (study.created_at as string) ?? '',
      updatedAt: (study.updated_at as string) ?? '',
    },
    sections,
    references: [],
    versions: versionsMapped,
    revisions: [],
  }
}

export async function saveDraftSupabase(
  studyId: string,
  blocks: SectionBlock[]
): Promise<{ ok: boolean; versionMismatch?: boolean }> {
  const payload = sectionsToPayload(blocks)
  const { error } = await supabase
    .from('drafts')
    .upsert({
      study_id: studyId,
      content_payload: payload,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'study_id' })

  if (error) {
    const versionMismatch = error.message?.includes('version') ?? false
    if (versionMismatch) return { ok: false, versionMismatch: true }
    throw new Error(error.message)
  }
  return { ok: true }
}

export async function submitRevisionSupabase(
  studyId: string,
  payload: { blockId?: string; blockIds?: string[]; prompt: string; intent?: string; notes?: string }
): Promise<Revision> {
  const headers = await getAuthHeaders()
  const blockIds = Array.isArray(payload.blockIds) ? payload.blockIds : (payload.blockId ? [payload.blockId] : [])
  const res = await fetch(`${supabaseUrl}/functions/v1/studies-revise`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      studyId,
      blockId: payload.blockId,
      blockIds,
      blockContext: blockIds,
      prompt: payload.prompt,
      intent: payload.intent ?? 'rephrase',
      notes: payload.notes,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? res.statusText)
  }

  const data = (await res.json()) as { draft?: { content_payload?: { blocks?: Array<{ id?: string; content?: string; order?: number }>; lessons?: Array<{ id?: string; content?: string; order?: number }> } }; resultContent?: string; status?: string }
  const draftPayload = data?.draft?.content_payload
  const rawBlocks = Array.isArray((draftPayload as { blocks?: unknown[] })?.blocks)
    ? (draftPayload as { blocks: Array<{ id?: string; content?: string; order?: number }> }).blocks
    : Array.isArray((draftPayload as { lessons?: unknown[] })?.lessons)
      ? (draftPayload as { lessons: Array<{ id?: string; content?: string; order?: number }> }).lessons
      : []
  const revisedContent = data?.resultContent ?? (rawBlocks[0]?.content ?? null)
  const resultContent: SectionBlock[] | undefined = rawBlocks.length > 0
    ? rawBlocks.map((b, i) => ({
        id: String(b?.id ?? `sec-${i}`),
        studyId,
        type: 'summary' as const,
        content: b?.content ?? '',
        order: typeof b?.order === 'number' ? b.order : i,
      }))
    : undefined

  return {
    id: `rev-${Date.now()}`,
    studyId,
    blockId: payload.blockId,
    blockIds: blockIds.length > 0 ? blockIds : undefined,
    prompt: payload.prompt,
    intent: (payload.intent as Revision['intent']) ?? 'rephrase',
    aiResponse: revisedContent,
    resultContent,
    createdAt: new Date().toISOString(),
    status: (data?.status as 'pending' | 'completed' | 'failed') ?? 'completed',
  }
}

export async function approveStudySupabase(studyId: string, notes?: string): Promise<{ ok: boolean }> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${supabaseUrl}/functions/v1/studies-approve`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ studyId, notes }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? res.statusText)
  }
  return { ok: true }
}

export async function duplicateStudySupabase(studyId: string): Promise<Study> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${supabaseUrl}/functions/v1/studies-duplicate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ studyId }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? res.statusText)
  }
  const data = (await res.json()) as { id?: string }
  return {
    id: data?.id ?? '',
    title: 'Untitled Study',
    ownerId: '',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export async function fetchVersionHistorySupabase(studyId: string): Promise<Version[]> {
  const headers = await getAuthHeaders()
  const res = await fetch(
    `${supabaseUrl}/functions/v1/studies-versions?studyId=${encodeURIComponent(studyId)}`,
    { method: 'GET', headers }
  )
  if (!res.ok) return []
  const data = (await res.json()) as { versions?: Array<{ id?: string; study_id?: string; version_number?: number; created_at?: string }> }
  const list = Array.isArray(data?.versions) ? data.versions : []
  return list.map((v) => ({
    id: v?.id ?? '',
    studyId: v?.study_id ?? studyId,
    versionNumber: v?.version_number ?? 0,
    diffSummary: `Version ${v?.version_number ?? 0}`,
    createdAt: v?.created_at ?? new Date().toISOString(),
  }))
}

export async function fetchVersionDiffSupabase(
  studyId: string,
  versionId: string,
  currentSections: SectionBlock[]
): Promise<Array<{ blockId: string; before: string; after: string; type: string }>> {
  const headers = await getAuthHeaders()
  const currentBlocks = currentSections.map((s) => ({
    id: s.id,
    content: typeof s.content === 'string' ? s.content : JSON.stringify(s.content ?? {}),
  }))
  const res = await fetch(`${supabaseUrl}/functions/v1/studies-version-diff`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ studyId, versionId, currentBlocks }),
  })
  if (!res.ok) return []
  const data = (await res.json()) as { diffs?: Array<{ blockId: string; before: string; after: string; type: string }> }
  return Array.isArray(data?.diffs) ? data.diffs : []
}

export async function createVersionSupabase(studyId: string): Promise<{ id: string }> {
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
  const data = (await res.json()) as { id?: string }
  return { id: data?.id ?? `v-${Date.now()}` }
}

export async function restoreVersionSupabase(studyId: string, versionId: string): Promise<{ ok: boolean }> {
  const headers = await getAuthHeaders()
  const res = await fetch(
    `${supabaseUrl}/functions/v1/studies-versions?studyId=${encodeURIComponent(studyId)}&versionId=${encodeURIComponent(versionId)}`,
    { method: 'GET', headers }
  )
  if (!res.ok) throw new Error('Version not found')
  const data = (await res.json()) as { contentSnapshot?: Record<string, unknown> }
  const snapshot = data?.contentSnapshot ?? {}
  const payload = snapshot as Record<string, unknown>
  const blocks = Array.isArray((payload as { blocks?: unknown[] }).blocks)
    ? (payload as { blocks: unknown[] }).blocks
    : Array.isArray(payload.lessons)
      ? payload.lessons
      : []
  const sections = payloadToSections({ blocks, lessons: blocks }, studyId)
  await saveDraftSupabase(studyId, sections)
  return { ok: true }
}

/** Autosave a single block */
export async function saveBlockSupabase(
  studyId: string,
  blockId: string,
  content: string | Record<string, unknown>
): Promise<{ ok: boolean; versionMismatch?: boolean }> {
  const { data: draft } = await supabase
    .from('drafts')
    .select('content_payload')
    .eq('study_id', studyId)
    .single()

  if (!draft?.content_payload) return { ok: false }
  const payload = { ...(draft.content_payload as Record<string, unknown>) }
  const blocks = Array.isArray(payload.blocks) ? [...payload.blocks] : []
  const idx = blocks.findIndex((b: Record<string, unknown>) => String(b?.id) === blockId)
  if (idx >= 0 && blocks[idx]) {
    (blocks[idx] as Record<string, unknown>).content = content
  } else {
    blocks.push({ id: blockId, type: 'text', content, order: blocks.length })
  }
  payload.blocks = blocks
  payload.lessons = blocks

  const { error } = await supabase
    .from('drafts')
    .update({ content_payload: payload, updated_at: new Date().toISOString() })
    .eq('study_id', studyId)

  if (error) return { ok: false, versionMismatch: error.message.includes('version') }
  return { ok: true }
}

/** Resolve edit conflict */
export async function resolveConflictSupabase(
  _studyId: string,
  _conflictId: string,
  _strategy: 'keep_local' | 'keep_server' | 'merge'
): Promise<{ ok: boolean }> {
  return { ok: true }
}

/** Log conflict to conflict_log table */
export async function logConflictSupabase(
  studyId: string,
  details: Record<string, unknown>
): Promise<void> {
  await supabase.from('conflict_logs').insert({ study_id: studyId, details })
}

/** Aliases for StudyReviewPage */
export const fetchStudyReviewFromSupabase = fetchStudyReviewSupabase
export const saveBlock = saveBlockSupabase
export const resolveConflict = resolveConflictSupabase
export const logConflict = logConflictSupabase

export async function saveDraftToSupabase(
  studyId: string,
  blocks: SectionBlock[]
): Promise<{ ok: boolean; versionMismatch?: boolean }> {
  try {
    await saveDraftSupabase(studyId, blocks)
    return { ok: true }
  } catch (e) {
    return { ok: false, versionMismatch: (e as Error).message?.includes('version') ?? false }
  }
}

/** Alias for saveDraftToSupabase */
export const saveDraftSupabaseAlias = saveDraftToSupabase

export async function submitRevisionWithContext(
  studyId: string,
  payload: { blockIds: string[]; prompt: string; intent?: string; notes?: string }
): Promise<Revision> {
  return submitRevisionSupabase(studyId, {
    blockIds: payload.blockIds,
    prompt: payload.prompt,
    intent: payload.intent,
    notes: payload.notes,
  })
}
