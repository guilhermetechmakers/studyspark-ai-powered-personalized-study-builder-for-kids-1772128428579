import { useCallback, useRef, useState } from 'react'
import {
  Upload,
  FileText,
  Image,
  X,
  Loader2,
  Check,
  Edit3,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { dataGuard } from '@/lib/data-guard'
import type { Material, OCRStatus } from '@/types/study-wizard'
import { cn } from '@/lib/utils'

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]
const MAX_SIZE_MB = 10

export interface MaterialsUploaderProps {
  materials: Material[]
  onChange: (materials: Material[]) => void
  onOcrStatusChange?: (materialId: string, status: OCRStatus) => void
  errors?: Record<string, string>
  className?: string
}

function getFileIcon(type: string) {
  if (type === 'document' || type?.includes('pdf')) return FileText
  return Image
}

export function MaterialsUploader({
  materials,
  onChange,
  onOcrStatusChange,
  errors = {},
  className,
}: MaterialsUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [transcriptionValue, setTranscriptionValue] = useState('')
  const safeMaterials = dataGuard(materials)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const files = Array.from(e.dataTransfer?.files ?? [])
      addFiles(files)
    },
    [materials, onChange]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const addFiles = useCallback(
    (files: File[]) => {
      const valid = files.filter((f) => {
        const ok =
          ACCEPTED_TYPES.some((t) => f.type === t || f.type.startsWith(t.split('/')[0] + '/')) ||
          f.type.startsWith('image/') ||
          f.type === 'application/pdf'
        const sizeOk = (f.size ?? 0) <= MAX_SIZE_MB * 1024 * 1024
        return ok && sizeOk
      })
      const newMaterials: Material[] = valid.map((f, i) => ({
        id: `local-${Date.now()}-${i}`,
        name: f.name,
        url: URL.createObjectURL(f),
        type: f.type.startsWith('image/') ? 'photo' : 'document',
        uploadedAt: new Date().toISOString(),
        ocrStatus: 'not_started' as OCRStatus,
        file: f,
        size: f.size,
      }))
      onChange([...safeMaterials, ...newMaterials])
    },
    [safeMaterials, onChange]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? [])
      addFiles(files)
      e.target.value = ''
    },
    [addFiles]
  )

  const removeMaterial = useCallback(
    (id: string) => {
      onChange(safeMaterials.filter((m) => m.id !== id))
      if (editingId === id) setEditingId(null)
    },
    [safeMaterials, onChange, editingId]
  )

  const startTranscription = useCallback(
    (m: Material) => {
      setEditingId(m.id)
      setTranscriptionValue(m.transcription ?? '')
    },
    []
  )

  const saveTranscription = useCallback(() => {
    if (!editingId) return
    onChange(
      safeMaterials.map((m) =>
        m.id === editingId ? { ...m, transcription: transcriptionValue } : m
      )
    )
    setEditingId(null)
    setTranscriptionValue('')
  }, [editingId, transcriptionValue, safeMaterials, onChange])

  const cancelTranscription = useCallback(() => {
    setEditingId(null)
    setTranscriptionValue('')
  }, [])

  const simulateOcr = useCallback(
    (id: string) => {
      onOcrStatusChange?.(id, 'in_progress')
      setTimeout(() => onOcrStatusChange?.(id, 'done'), 1500)
    },
    [onOcrStatusChange]
  )

  return (
    <div className={cn('space-y-6', className)}>
      <Card className="overflow-hidden border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--lavender))]/10 to-white">
        <CardHeader>
          <CardTitle>Upload Materials</CardTitle>
          <CardDescription>
            Drag and drop documents or images. We&apos;ll extract text with OCR. Supports PDF, JPG,
            PNG.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            role="button"
            tabIndex={0}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                inputRef.current?.click()
              }
            }}
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-[rgb(var(--peach-light))]/20 py-12 transition-colors hover:border-primary/60 hover:bg-[rgb(var(--peach-light))]/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Upload files by clicking or dragging"
          >
            <Upload className="mb-4 h-12 w-12 text-primary" aria-hidden />
            <p className="mb-1 font-medium text-foreground">Drag and drop files here</p>
            <p className="mb-4 text-sm text-muted-foreground">
              or click to browse. Max {MAX_SIZE_MB}MB per file.
            </p>
            <Button variant="outline" type="button" onClick={(e) => e.stopPropagation()}>
              Choose files
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              multiple
              className="hidden"
              onChange={handleFileSelect}
              aria-hidden
            />
          </div>

          {errors.materials && (
            <p className="text-sm text-destructive">{errors.materials}</p>
          )}

          {safeMaterials.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Uploaded files</h4>
              <ul className="space-y-2">
                {safeMaterials.map((m) => {
                  const Icon = getFileIcon(m.type)
                  return (
                    <li
                      key={m.id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-shadow hover:shadow-sm"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{m.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {m.ocrStatus === 'not_started' && (
                            <button
                              type="button"
                              onClick={() => simulateOcr(m.id)}
                              className="text-primary hover:underline"
                            >
                              Start OCR
                            </button>
                          )}
                          {m.ocrStatus === 'in_progress' && (
                            <span className="flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              OCR in progress
                            </span>
                          )}
                          {m.ocrStatus === 'done' && (
                            <span className="flex items-center gap-1 text-green-600">
                              <Check className="h-3 w-3" />
                              OCR complete
                            </span>
                          )}
                          {m.size != null && (
                            <span>{(m.size / 1024).toFixed(1)} KB</span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startTranscription(m)}
                          aria-label="Edit transcription"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMaterial(m.id)}
                          aria-label="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  )
                })}
              </ul>

              {editingId && (
                <Card className="mt-4 border-2 border-primary/30">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Manual transcription</CardTitle>
                    <CardDescription>
                      Add or edit extracted text if OCR didn&apos;t work well.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Textarea
                      value={transcriptionValue}
                      onChange={(e) => setTranscriptionValue(e.target.value)}
                      rows={4}
                      placeholder="Paste or type the document content..."
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveTranscription}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelTranscription}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
