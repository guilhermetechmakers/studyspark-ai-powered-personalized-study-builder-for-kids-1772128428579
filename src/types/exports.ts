/**
 * Export & Print-Ready Generation - Type definitions
 */

export type PaperSize = 'A4' | 'Letter' | 'Legal'
export type Orientation = 'portrait' | 'landscape'
export type ExportType = 'pdf' | 'bundle'
export type ExportJobStatus =
  | 'queued'
  | 'processing'
  | 'rendering'
  | 'completed'
  | 'failed'
  | 'partial'
  | 'cancelled'

export interface ExportIncludeSections {
  studySheet?: boolean
  flashcards?: boolean
  answers?: boolean
  notes?: boolean
}

export interface CreateExportPayload {
  studyId: string
  exportType?: ExportType
  paperSize?: PaperSize
  orientation?: Orientation
  include?: ExportIncludeSections
  watermark?: boolean
  templateId?: string
}

export interface CreateExportResponse {
  jobId: string
  status: ExportJobStatus
  resultUrl?: string | null
}

export interface ExportJobStatusResponse {
  jobId: string
  status: ExportJobStatus
  progress: number
  resultUrl: string | null
  error: string | null
  createdAt: string
}

export interface ExportJobListItem {
  id: string
  studyId: string
  exportType: ExportType
  status: ExportJobStatus
  progress: number
  resultUrl: string | null
  error?: string | null
  watermarkEnabled: boolean
  paperSize: PaperSize
  orientation: Orientation
  createdAt: string
  studyTitle: string
}

export interface ExportTemplatesResponse {
  data: ExportTemplate[]
}

export interface ExportTemplate {
  id: string
  name: string
  type: ExportType
  paperSize: PaperSize
  orientation: Orientation
  thumbnail: string | null
}
