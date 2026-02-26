/**
 * Upload Materials type definitions.
 * Supports OCR snippets, confidence highlighting, and AI context selection.
 * All types support runtime safety with optional chaining and defaults.
 */

export type OcrStatus = 'pending' | 'in_progress' | 'complete' | 'failed'

export interface SnippetPosition {
  start: number
  end: number
}

export interface Snippet {
  id: string
  text: string
  confidence: number
  important: boolean
  position?: SnippetPosition
}

export interface FileItem {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: string
  url?: string
  ocrStatus: OcrStatus
  ocrText?: string
  ocrSnippets: Snippet[]
  file?: File
}

export interface ValidationError {
  id?: string
  message: string
  field?: string
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
