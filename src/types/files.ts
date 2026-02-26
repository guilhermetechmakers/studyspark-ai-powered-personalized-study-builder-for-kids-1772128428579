/**
 * File Upload & OCR Ingestion - Type definitions.
 * All types support runtime safety with optional chaining and defaults.
 */

export type OcrStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'corrected'

export type VirusScanStatus = 'pending' | 'clean' | 'infected'

export interface FileMeta {
  id: string
  filename: string
  mimeType: string
  size: number
  ocrStatus: OcrStatus
  ocrConfidence?: number | null
  ocrText?: string | null
  ocrVersion: number
  relatedStudyId?: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

/** Alias for FileMeta - components may use either shape */
export type UploadedFile = FileMeta & {
  owner_id?: string
  mime_type?: string
  storage_key?: string
  ocr_status?: OcrStatus
  ocr_confidence?: number | null
  ocr_text?: string | null
  ocr_version?: number
  related_study_id?: string | null
  child_profile_id?: string | null
  created_at?: string
  updated_at?: string
}

export interface OcrBlock {
  text: string
  confidence?: number
  index?: number
  boundingBox?: unknown
}

export interface OcrResult {
  id?: string
  fileId?: string
  file_id?: string
  fullText?: string | null
  full_text?: string | null
  language?: string | null
  blocks: OcrBlock[]
  words?: unknown[]
}

export interface InitUploadResponse {
  fileId: string
  storagePath: string
  filename: string
}

export interface CompleteUploadResponse {
  fileId: string
  ocrStatus: OcrStatus
  ocrConfidence?: number
}

export interface FileGetResponse {
  file: FileMeta
  downloadUrl: string | null
}

export interface CorrectionsResponse {
  fileId: string
  version: number
}

export interface FilesSearchResponse {
  data: FileMeta[]
  count: number
}

export const ACCEPTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

export const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf', '.docx'] as const

export const MAX_FILE_SIZE_MB = 25

export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
