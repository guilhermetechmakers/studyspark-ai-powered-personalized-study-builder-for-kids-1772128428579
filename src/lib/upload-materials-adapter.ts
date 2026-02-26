/**
 * Adapters between Material (study-wizard) and FileItem (upload-materials).
 * Maps OCR status and ensures type safety.
 */

import type { Material, OCRStatus, Snippet } from '@/types/study-wizard'
import type { FileItem, OcrStatus } from '@/types/upload-materials'

function toOcrStatus(s?: OCRStatus): OcrStatus {
  switch (s) {
    case 'not_started':
      return 'pending'
    case 'in_progress':
      return 'in_progress'
    case 'done':
      return 'complete'
    case 'failed':
      return 'failed'
    default:
      return 'pending'
  }
}

function toMaterialOcrStatus(s?: OcrStatus): OCRStatus {
  switch (s) {
    case 'pending':
      return 'not_started'
    case 'in_progress':
      return 'in_progress'
    case 'complete':
      return 'done'
    case 'failed':
      return 'failed'
    default:
      return 'not_started'
  }
}

function inferMimeType(m: Material): string {
  if (m.file?.type) return m.file.type
  const ext = (m.name?.split('.').pop() ?? '').toLowerCase()
  if (['jpg', 'jpeg'].includes(ext)) return 'image/jpeg'
  if (ext === 'png') return 'image/png'
  if (ext === 'pdf') return 'application/pdf'
  if (ext === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  return m.type === 'document' ? 'application/pdf' : 'image/jpeg'
}

export function materialToFileItem(m: Material): FileItem {
  return {
    id: m.id,
    name: m.name,
    size: m.size ?? 0,
    type: inferMimeType(m),
    uploadedAt: m.uploadedAt,
    url: m.url,
    ocrStatus: toOcrStatus(m.ocrStatus),
    ocrText: m.ocrText ?? m.transcription,
    ocrSnippets: (m.ocrSnippets ?? []) as Snippet[],
    file: m.file,
  }
}

export function fileItemToMaterial(f: FileItem): Material {
  const matType: 'document' | 'photo' = f.type?.startsWith('image/') ? 'photo' : 'document'
  return {
    id: f.id,
    name: f.name,
    url: f.url ?? '',
    type: matType,
    uploadedAt: f.uploadedAt,
    ocrStatus: toMaterialOcrStatus(f.ocrStatus),
    transcription: f.ocrText,
    ocrText: f.ocrText,
    ocrSnippets: (f.ocrSnippets ?? []) as Snippet[],
    file: f.file,
    size: f.size,
  }
}
