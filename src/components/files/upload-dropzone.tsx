/**
 * UploadDropzone - Drag-and-drop file upload area.
 * Supports multiple files, progress tracking, and validation.
 */

import { useCallback, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  ACCEPTED_FILE_TYPES,
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
} from '@/types/files'

export interface UploadDropzoneProps {
  onFilesAdd: (files: File[]) => void
  acceptTypes?: readonly string[]
  maxSize?: number
  disabled?: boolean
  className?: string
}

const DEFAULT_ACCEPT = ACCEPTED_FILE_TYPES
const DEFAULT_MAX_SIZE = MAX_FILE_SIZE_BYTES

function validateFile(file: File, maxSize: number): string | null {
  const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase()
  const typeOk =
    ACCEPTED_FILE_TYPES.some((t) => file.type === t || file.type.startsWith(t.split('/')[0] + '/')) ||
    ACCEPTED_EXTENSIONS.includes(ext as (typeof ACCEPTED_EXTENSIONS)[number])
  if (!typeOk) {
    return `"${file.name}" has unsupported type. Use JPG, PNG, PDF, or DOCX.`
  }
  if ((file.size ?? 0) > maxSize) {
    return `"${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB limit.`
  }
  return null
}

export function UploadDropzone({
  onFilesAdd,
  acceptTypes = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  disabled = false,
  className,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files ?? [])
      const valid: File[] = []
      const newErrors: string[] = []

      for (const file of fileArray) {
        const err = validateFile(file, maxSize)
        if (err) {
          newErrors.push(err)
        } else {
          valid.push(file)
        }
      }

      setErrors(newErrors)
      if (valid.length > 0) {
        onFilesAdd(valid)
      }
    },
    [onFilesAdd, maxSize]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragOver(false)
      if (!disabled) processFiles(e.dataTransfer?.files ?? [])
    },
    [processFiles, disabled]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) setDragOver(true)
    },
    [disabled]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }, [])

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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
        e.preventDefault()
        inputRef.current?.click()
      }
    },
    [disabled]
  )

  const acceptStr = Array.isArray(acceptTypes) ? acceptTypes.join(',') : ''

  return (
    <div className={cn('space-y-2', className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        aria-label="Upload files by clicking or dragging"
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-12 transition-all duration-200',
          'bg-gradient-to-br from-[rgb(var(--peach-light))]/20 to-[rgb(var(--peach))]/10',
          'border-[rgb(var(--lavender))]/40 hover:border-[rgb(var(--lavender))]/70',
          'hover:shadow-card focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          dragOver && !disabled && 'border-primary scale-[1.01] bg-[rgb(var(--peach-light))]/40',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        <Upload
          className={cn(
            'mb-4 h-12 w-12 text-primary transition-transform duration-200',
            dragOver && !disabled && 'scale-110'
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
          disabled={disabled}
        >
          Browse files
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={acceptStr}
          multiple
          className="hidden"
          onChange={handleFileSelect}
          aria-hidden
          disabled={disabled}
        />
      </div>

      {errors.length > 0 && (
        <div className="animate-fade-in rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2">
          <p className="text-sm font-medium text-destructive">Validation issues:</p>
          <ul className="mt-1 list-inside list-disc text-sm text-destructive/90">
            {(errors ?? []).map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
