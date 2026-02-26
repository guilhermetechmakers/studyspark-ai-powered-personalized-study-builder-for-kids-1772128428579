/**
 * Study Review API - Fetch, save, revise, export, share.
 * Uses native fetch via src/lib/api.ts
 */

import {
  apiGet,
  apiPost,
} from '@/lib/api'
import type {
  Study,
  SectionBlock,
  Revision,
  Version,
  SourceReference,
  StudyReviewData,
} from '@/types/study-review'
import { normalizeApiResponse } from '@/lib/data-guard'

export interface StudyReviewResponse {
  study?: Study
  sections?: SectionBlock[]
  references?: SourceReference[]
  versions?: Version[]
  revisions?: Revision[]
}

export async function fetchStudyReview(studyId: string): Promise<StudyReviewData> {
  const res = await apiGet<StudyReviewResponse>(`/api/studies/${studyId}/review`)
  const study = res?.study ?? null
  const sections = Array.isArray(res?.sections) ? res.sections : []
  const references = Array.isArray(res?.references) ? res.references : []
  const versions = Array.isArray(res?.versions) ? res.versions : []
  const revisions = Array.isArray(res?.revisions) ? res.revisions : []

  return {
    study: study ?? {
      id: studyId,
      title: 'Untitled Study',
      ownerId: '',
      status: 'draft',
      createdAt: '',
      updatedAt: '',
    },
    sections,
    references,
    versions,
    revisions,
  }
}

export interface SaveDraftPayload {
  blocks: SectionBlock[]
  revisions?: Revision[]
}

export async function saveDraft(studyId: string, payload: SaveDraftPayload): Promise<{ ok: boolean }> {
  await apiPost(`/api/studies/${studyId}/drafts`, payload)
  return { ok: true }
}

export interface SubmitRevisionPayload {
  blockId: string
  prompt: string
  notes?: string
}

export async function submitRevision(
  studyId: string,
  payload: SubmitRevisionPayload
): Promise<Revision> {
  const res = await apiPost<Revision>(`/api/studies/${studyId}/revisions`, payload)
  return res ?? { id: '', studyId, blockId: payload.blockId, prompt: payload.prompt, aiResponse: null, createdAt: new Date().toISOString(), status: 'pending' }
}

export async function approveStudy(studyId: string): Promise<{ ok: boolean }> {
  await apiPost(`/api/studies/${studyId}/approve`, {})
  return { ok: true }
}

export type ExportFormat = 'pdf' | 'zip'

export async function exportStudy(
  studyId: string,
  format: ExportFormat
): Promise<{ url: string }> {
  const res = await apiPost<{ url: string }>(
    `/api/studies/${studyId}/export?format=${format}`,
    {}
  )
  return res ?? { url: '' }
}

export interface SharePayload {
  method: 'link' | 'email'
  email?: string
}

export async function shareStudy(
  studyId: string,
  payload: SharePayload
): Promise<{ link?: string; emailSent?: boolean }> {
  const res = await apiPost<{ link?: string; emailSent?: boolean }>(
    `/api/studies/${studyId}/share`,
    payload
  )
  return res ?? {}
}

export async function fetchVersionHistory(studyId: string): Promise<Version[]> {
  const res = await apiGet<{ data?: Version[] } | Version[]>(
    `/api/studies/${studyId}/versions`
  )
  const raw = Array.isArray(res) ? res : (res as { data?: Version[] })?.data
  return normalizeApiResponse<Version>(raw)
}

export async function restoreVersion(
  studyId: string,
  versionId: string
): Promise<{ ok: boolean }> {
  await apiPost(`/api/studies/${studyId}/versions/${versionId}/restore`, {})
  return { ok: true }
}

export async function duplicateStudy(studyId: string): Promise<Study> {
  const res = await apiPost<Study>(`/api/studies/${studyId}/duplicate`, {})
  return res ?? { id: '', title: '', ownerId: '', status: 'draft', createdAt: '', updatedAt: '' }
}
