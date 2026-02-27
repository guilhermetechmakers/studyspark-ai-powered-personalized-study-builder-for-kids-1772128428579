/**
 * Upload dropzone with real API integration.
 * Uses initUpload -> Supabase Storage upload -> completeUpload flow.
 * Per-file progress, retries, and OCR status.
 */

import { useCallback, useRef, useState } from 'react'
import { Upload, Loader2, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  initUpload,
  completeUpload,
  uploadToStorage,
  uploadFileDirect,
} from '@/api/files'
import { toast } from 'sonner'
import {
  ACCEPTED_FILE_TYPES,
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
} from '@/types/files'

export interface UploadedFileItem {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: string
  url?: string
  ocrStatus: 'pending' | 'in_progress' | 'completed' | 'failed' | 'corrected'
  ocrText?: string
  progress: number
  error?: string
}

export interface UploadDropzoneWithApiProps {
  onFileUploaded?: (file: UploadedFileItem) => void
  onUploadingChange?: (uploading: boolean) => void
  onUploadError?: (message: string, fileName?: string) => void
  relatedStudyId?: string
  className?: string
}

function validateFile(file: File): string | null {
  const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase()
  const typeOk =
    ACCEPTED_FILE_TYPES.some((t) => file.type === t || file.type.startsWith(t.split('/')[0] + '/')) ||
    ACCEPTED_EXTENSIONS.includes(ext as (typeof ACCEPTED_EXTENSIONS)[number])
  if (!typeOk) {
    return `"${file.name}" has unsupported type. Use JPG, PNG, PDF, or DOCX.`
  }
  if ((file.size ?? 0) > MAX_FILE_SIZE_BYTES) {
    return `"${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB limit.`
  }
  return null
}

export function UploadDropzoneWithApi({
  onFileUploaded,
  onUploadingChange,
  onUploadError,
  relatedStudyId,
  className,
}: UploadDropzoneWithApiProps) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<UploadedFileItem[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const fileArray = Array.from(fileList ?? [])
      const valid: File[] = []
      const newErrors: string[] = []

      for (const file of fileArray) {
        const err = validateFile(file)
        if (err) newErrors.push(err)
        else valid.push(file)
      }

      setErrors(newErrors)
      if (valid.length === 0) return

      setUploading(true)
      onUploadingChange?.(true)

      for (const file of valid) {
        const tempId = `temp-${Date.now()}-${file.name}`
        setFiles((prev) => [
          ...prev,
          {
            id: tempId,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            ocrStatus: 'pending',
            progress: 0,
          },
        ])

        try {
          let initRes: { fileId: string; storagePath: string } | null = null
          try {
            initRes = await initUpload({
              filename: file.name,
              mimeType: file.type,
              size: file.size,
              relatedStudyId: relatedStudyId ?? null,
            })
          } catch {
            initRes = null
          }

          if (!initRes?.fileId || !initRes?.storagePath) {
            const directRes = await uploadFileDirect(file, relatedStudyId ?? null)
            if (directRes.error) throw new Error(directRes.error)
            if (directRes.fileId) {
              const completeRes = await completeUpload(directRes.fileId)
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === tempId
                    ? { ...f, id: completeRes.fileId!, progress: 100, ocrStatus: 'completed' as const }
                    : f
                )
              )
              onFileUploaded?.({
                id: completeRes.fileId,
                name: file.name,
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString(),
                ocrStatus: 'completed',
                progress: 100,
              })
              toast.success(`${file.name} uploaded and OCR complete`)
            }
            continue
          }

          setFiles((prev) =>
            prev.map((f) => (f.id === tempId ? { ...f, progress: 30 } : f))
          )

          await uploadToStorage(initRes.storagePath, file)

          setFiles((prev) =>
            prev.map((f) => (f.id === tempId ? { ...f, progress: 80 } : f))
          )

          const completeRes = await completeUpload(initRes.fileId)

          setFiles((prev) =>
            prev.map((f) =>
              f.id === tempId
                ? {
                    ...f,
                    id: completeRes.fileId!,
                    progress: 100,
                    ocrStatus: 'completed' as const,
                  }
                : f
            )
          )

          onFileUploaded?.({
            id: completeRes.fileId!,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            ocrStatus: 'completed',
            progress: 100,
          })
          toast.success(`${file.name} uploaded and OCR complete`)
        } catch (err) {
          const msg = (err as Error).message
          setFiles((prev) =>
            prev.map((f) =>
              f.id === tempId
                ? { ...f, progress: 0, ocrStatus: 'failed' as const, error: msg }
                : f
            )
          )
          toast.error(`${file.name}: ${msg}`)
          onUploadError?.(msg, file.name)
        }
      }

      setUploading(false)
      onUploadingChange?.(false)
    },
    [relatedStudyId, onFileUploaded, onUploadingChange, onUploadError]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragOver(false)
      processFiles(e.dataTransfer?.files ?? [])
    },
    [processFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }, [])

  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ?? []
      processFiles(files)
      e.target.value = ''
    },
    [processFiles]
  )

  const handleBrowseClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    inputRef.current?.click()
  }, [])

  return (
    <div className={cn('space-y-4', className)}>
      <div
        role="button"
        tabIndex={0}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        aria-label="Upload files by clicking or dragging"
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-12 transition-all duration-200',
          'bg-gradient-to-br from-[rgb(var(--peach-light))]/20 to-[rgb(var(--peach))]/10',
          'border-[rgb(var(--lavender))]/40 hover:border-[rgb(var(--lavender))]/70',
          'hover:shadow-card focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          dragOver && 'border-primary scale-[1.01] bg-[rgb(var(--peach-light))]/40'
        )}
      >
        <Upload
          className={cn(
            'mb-4 h-12 w-12 text-primary transition-transform duration-200',
            dragOver && 'scale-110'
          )}
          aria-hidden
        />
        <p className="mb-1 font-semibold text-foreground">Drag and drop files here</p>
        <p className="mb-4 text-sm text-muted-foreground">
          or click to browse. JPG, PNG, PDF, DOCX up to {MAX_FILE_SIZE_MB}MB each.
        </p>
        <Button
          variant="outline"
          type="button"
          onClick={handleBrowseClick}
          className="rounded-full"
          disabled={uploading}
          aria-label={uploading ? 'Upload in progress, please wait' : 'Browse and select files to upload'}
          aria-busy={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Uploading...
            </>
          ) : (
            'Browse files'
          )}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={handleFileSelect}
          aria-hidden
        />
      </div>

      {errors.length > 0 && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 px-4 py-3"
        >
          <p className="text-sm font-medium text-destructive">Validation issues:</p>
          <ul className="mt-1 list-inside list-disc text-sm text-destructive/90">
            {errors.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-3" role="region" aria-label="Upload progress">
          <p className="text-sm font-medium text-foreground">Upload progress</p>
          {(files ?? []).map((f) => (
            <div
              key={f.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-card"
              role="status"
              aria-label={`${f.name}: ${f.ocrStatus === 'completed' ? 'Upload complete' : f.ocrStatus === 'failed' ? `Failed - ${f.error ?? 'Unknown error'}` : f.ocrStatus === 'in_progress' ? 'Processing' : 'Pending'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium text-foreground">{f.name}</span>
                {f.ocrStatus === 'completed' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/20 px-2 py-0.5 text-xs font-medium text-success-foreground">
                    <Check className="h-3 w-3" aria-hidden />
                    Done
                  </span>
                )}
                {f.ocrStatus === 'in_progress' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                    OCR
                  </span>
                )}
                {f.ocrStatus === 'failed' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                    <AlertCircle className="h-3 w-3" aria-hidden />
                    Failed
                  </span>
                )}
              </div>
              <Progress value={f.progress} className="mt-2 h-2" />
              {f.error && (
                <p className="mt-2 text-xs text-destructive" role="alert">
                  {f.error}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
