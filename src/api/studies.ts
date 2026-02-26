/**
 * Studies API - Create Study Wizard.
 * Placeholder stubs for backend integration.
 * Uses native fetch via src/lib/api.ts
 */

import {
  apiGet,
  apiPost,
  apiPut,
} from '@/lib/api'
import type {
  Study,
  Material,
  Version,
  Revision,
  AIOutputBlock,
} from '@/types/study-wizard'
import { normalizeApiResponse } from '@/lib/data-guard'

export interface CreateStudyPayload {
  topic: string
  subject: string
  contextNotes?: string
  examDate?: string
  childProfileId: string
  learningStyle: string
  generationOptions: { depth: string; outputs: string[]; curriculumAligned: boolean }
  materials?: string[]
}

export interface CreateStudyResponse {
  id: string
  study: Study
}

export async function createStudy(payload: CreateStudyPayload): Promise<CreateStudyResponse> {
  const res = await apiPost<CreateStudyResponse>('/studies', payload)
  return res
}

export async function fetchVersionHistory(studyId: string): Promise<Version[]> {
  const res = await apiGet<{ data?: Version[] } | Version[]>(`/studies/${studyId}/version-history`)
  const raw = Array.isArray(res) ? res : (res as { data?: Version[] })?.data
  return normalizeApiResponse<Version>(raw)
}

export async function fetchMaterials(studyId: string): Promise<Material[]> {
  const res = await apiGet<{ data?: Material[] } | Material[]>(`/materials?studyId=${studyId}`)
  const raw = Array.isArray(res) ? res : (res as { data?: Material[] })?.data
  return normalizeApiResponse<Material>(raw)
}

export async function startGeneration(studyId: string): Promise<{ ok: boolean }> {
  await apiPost(`/studies/${studyId}/generate`, {})
  return { ok: true }
}

export async function* streamGeneration(
  studyId: string
): AsyncGenerator<AIOutputBlock, void, unknown> {
  const API_BASE = import.meta.env.VITE_API_URL ?? ''
  const res = await fetch(`${API_BASE}/studies/${studyId}/generation-stream`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok || !res.body) {
    yield { type: 'text', content: 'Stream unavailable. Using mock.', order: 0 }
    return
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let order = 0
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
            const json = JSON.parse(line.slice(6))
            if (json?.content) {
              yield { type: json.type ?? 'text', content: json.content, order: order++, length: json.length }
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

export async function saveRevision(
  studyId: string,
  comments: string
): Promise<Revision> {
  const res = await apiPut<Revision>(`/studies/${studyId}/revisions`, { comments })
  return res
}

export async function duplicateStudy(studyId: string): Promise<Study> {
  const res = await apiPost<Study>(`/studies/${studyId}/duplicate`, {})
  return res
}

export async function exportStudy(
  studyId: string,
  format: 'pdf' | 'json'
): Promise<Blob> {
  const API_BASE = import.meta.env.VITE_API_URL ?? ''
  const res = await fetch(`${API_BASE}/studies/${studyId}/export?format=${format}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error('Export failed')
  return res.blob()
}
