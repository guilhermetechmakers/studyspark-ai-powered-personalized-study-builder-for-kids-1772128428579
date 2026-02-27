import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { FileUp, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UploadArea } from './upload-area'
import { FileCard } from './file-card'
import { OCRPanel } from './ocr-panel'
import { SnippetContextChipList } from './snippet-context-chip-list'
import { CloudImportBar } from './cloud-import-bar'
import { PreviewPanel } from './preview-panel'
import { ValidationSummary } from './validation-summary'
import { cn } from '@/lib/utils'
import type { FileItem, Snippet, ValidationError } from '@/types/upload-materials'
import { dataGuard } from '@/lib/data-guard'
import {
  initUpload,
  uploadToStorage,
  completeUpload,
  getOcr,
  saveCorrections,
} from '@/api/files'
import type { OcrBlock } from '@/types/files'

export interface UploadMaterialsContentProps {
  files?: FileItem[]
  onFilesChange?: (files: FileItem[]) => void
  onSave?: (payload: {
    files: FileItem[]
    importantSnippets: Snippet[]
  }) => void
  className?: string
}

function blocksToSnippets(blocks: OcrBlock[]): Snippet[] {
  const items = Array.isArray(blocks) ? blocks : []
  return items.map((b, i) => ({
    id: `snippet-${i}`,
    text: b?.text ?? '',
    confidence: b?.confidence ?? 0.9,
    important: false,
    position: { start: 0, end: (b?.text ?? '').length },
  }))
}

function normalizeOcrStatus(
  s: string | undefined
): 'pending' | 'in_progress' | 'complete' | 'failed' {
  if (s === 'completed' || s === 'corrected') return 'complete'
  if (s === 'in_progress' || s === 'pending' || s === 'failed') return s
  return 'pending'
}

export function UploadMaterialsContent({
  files = [],
  onFilesChange,
  onSave,
  className,
}: UploadMaterialsContentProps) {
  const safeFiles = dataGuard(files)
  const [localFiles, setLocalFiles] = useState<FileItem[]>(safeFiles)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    safeFiles[0]?.id ?? null
  )
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const allFiles = onFilesChange ? safeFiles : localFiles
  const setFiles = useCallback(
    (next: FileItem[] | ((prev: FileItem[]) => FileItem[])) => {
      const resolved = typeof next === 'function' ? next(allFiles) : next
      if (onFilesChange) {
        onFilesChange(resolved)
      } else {
        setLocalFiles(resolved)
      }
    },
    [allFiles, onFilesChange]
  )

  const selectedFile = useMemo(
    () => (allFiles ?? []).find((f) => f.id === selectedFileId) ?? null,
    [allFiles, selectedFileId]
  )

  const allSnippets = useMemo(() => {
    const fromSelected = selectedFile?.ocrSnippets ?? []
    const fromAll = (allFiles ?? []).flatMap((f) => dataGuard(f.ocrSnippets))
    return fromSelected.length > 0 ? fromSelected : fromAll
  }, [selectedFile, allFiles])

  const importantSnippets = useMemo(
    () => (allSnippets ?? []).filter((s) => s?.important === true),
    [allSnippets]
  )

  const isUploading = useMemo(
    () => (allFiles ?? []).some((f) => f?.ocrStatus === 'in_progress'),
    [allFiles]
  )

  const hasFiles = (allFiles ?? []).length > 0

  const handleFileAdd = useCallback(
    async (newFiles: File[]) => {
      const tempItems: FileItem[] = newFiles.map((f, i) => ({
        id: `temp-${Date.now()}-${i}`,
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: new Date().toISOString(),
        url: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
        ocrStatus: 'pending' as const,
        ocrSnippets: [],
        file: f,
      }))
      setFiles((prev) => [...prev, ...tempItems])
      setErrors([])

      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i]
        const tempId = tempItems[i]?.id ?? `temp-${i}`
        try {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === tempId ? { ...f, ocrStatus: 'in_progress' as const } : f
            )
          )

          const { fileId, storagePath } = await initUpload({
            filename: file.name,
            mimeType: file.type,
            size: file.size,
          })

          await uploadToStorage(storagePath, file)

          const { ocrStatus } = await completeUpload(fileId)

          const ocrResult = await getOcr(fileId)
          const blocks = (ocrResult?.blocks ?? []) as OcrBlock[]
          const snippets = blocksToSnippets(blocks)
          const fullText = ocrResult?.fullText ?? ''

          setFiles((prev) =>
            prev.map((f) =>
              f.id === tempId
                ? {
                    ...f,
                    id: fileId,
                    name: file.name,
                    ocrStatus: normalizeOcrStatus(ocrStatus) as 'complete',
                    ocrText: fullText,
                    ocrSnippets: snippets,
                  }
                : f
            )
          )
          if (!selectedFileId) setSelectedFileId(fileId)
          toast.success(`Processed ${file.name}`)
        } catch (err) {
          const msg = (err as Error)?.message ?? 'Upload failed'
          toast.error(msg)
          setFiles((prev) =>
            prev.map((f) =>
              f.id === tempId ? { ...f, ocrStatus: 'failed' as const } : f
            )
          )
        }
      }
    },
    [setFiles, selectedFileId]
  )

  const handleRemove = useCallback(
    (id: string) => {
      setFiles((prev) => prev.filter((f) => f.id !== id))
      if (selectedFileId === id) {
        const remaining = (allFiles ?? []).filter((f) => f.id !== id)
        setSelectedFileId(remaining[0]?.id ?? null)
      }
    },
    [setFiles, allFiles, selectedFileId]
  )

  const handleRetryOcr = useCallback(
    async (id: string) => {
      const file = (allFiles ?? []).find((f) => f.id === id)
      if (!file || id.startsWith('temp-')) return

      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, ocrStatus: 'in_progress' as const, ocrSnippets: [] } : f
        )
      )

      try {
        const { ocrStatus } = await completeUpload(id)
        const ocrResult = await getOcr(id)
        const blocks = (ocrResult?.blocks ?? []) as OcrBlock[]
        const snippets = blocksToSnippets(blocks)
        const fullText = ocrResult?.fullText ?? ''

        setFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? {
                  ...f,
                  ocrStatus: normalizeOcrStatus(ocrStatus) as 'complete',
                  ocrText: fullText,
                  ocrSnippets: snippets,
                }
              : f
          )
        )
        toast.success('OCR complete')
      } catch (err) {
        toast.error((err as Error)?.message ?? 'OCR failed')
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, ocrStatus: 'failed' as const } : f
          )
        )
      }
    },
    [allFiles, setFiles]
  )

  const handleSnippetEdit = useCallback(
    (snippetId: string, newText: string) => {
      if (!selectedFileId) return
      setFiles((prev) =>
        prev.map((f) =>
          f.id === selectedFileId
            ? {
                ...f,
                ocrSnippets: (f.ocrSnippets ?? []).map((s) =>
                  s.id === snippetId ? { ...s, text: newText } : s
                ),
              }
            : f
        )
      )
    },
    [selectedFileId, setFiles]
  )

  const handleToggleImportant = useCallback(
    (snippetId: string) => {
      if (!selectedFileId) return
      setFiles((prev) =>
        prev.map((f) =>
          f.id === selectedFileId
            ? {
                ...f,
                ocrSnippets: (f.ocrSnippets ?? []).map((s) =>
                  s.id === snippetId ? { ...s, important: !s.important } : s
                ),
              }
            : f
        )
      )
    },
    [selectedFileId, setFiles]
  )

  const handleRemoveFromContext = useCallback(
    (snippetId: string) => {
      if (!selectedFileId) return
      setFiles((prev) =>
        prev.map((f) =>
          f.id === selectedFileId
            ? {
                ...f,
                ocrSnippets: (f.ocrSnippets ?? []).map((s) =>
                  s.id === snippetId ? { ...s, important: false } : s
                ),
              }
            : f
        )
      )
    },
    [selectedFileId, setFiles]
  )

  const handleSave = useCallback(async () => {
    const validationErrors: ValidationError[] = []
    if ((allFiles ?? []).length === 0) {
      validationErrors.push({ message: 'Add at least one file before saving.' })
    }
    setErrors(validationErrors)
    if (validationErrors.length > 0) {
      toast.error('Please fix the errors before saving.')
      return
    }

    setIsSaving(true)
    const filesToSave = allFiles ?? []
    try {
      for (const f of filesToSave) {
        if (!f.id.startsWith('temp-') && (f.ocrSnippets ?? []).length > 0) {
          const correctedText = (f.ocrSnippets ?? [])
            .map((s) => s?.text ?? '')
            .filter(Boolean)
            .join(' ')
          if (correctedText) {
            try {
              await saveCorrections(f.id, correctedText)
            } catch {
              // Non-blocking
            }
          }
        }
      }

      onSave?.({
        files: filesToSave,
        importantSnippets,
      })
      if (!onSave) toast.success('Materials saved!')
    } catch (err) {
      toast.error((err as Error)?.message ?? 'Failed to save materials')
    } finally {
      setIsSaving(false)
    }
  }, [allFiles, importantSnippets, onSave])

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Upload Materials
        </h2>
        <p className="text-muted-foreground">
          Upload teacher-provided documents and photos. We&apos;ll extract text and let you mark
          important snippets for AI-generated study materials.
        </p>
      </div>

      <Card className="overflow-hidden border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--lavender))]/10 to-card">
        <CardHeader>
          <CardTitle>Add files</CardTitle>
          <CardDescription>
            Drag and drop or browse. Supports JPG, PNG, PDF, DOCX up to 25MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UploadArea onFileAdd={handleFileAdd} />
          <CloudImportBar />
        </CardContent>
      </Card>

      {isUploading && (
        <div
          className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden />
          <p className="text-sm font-medium text-foreground">
            Processing files… Text extraction in progress.
          </p>
        </div>
      )}

      <ValidationSummary errors={errors} />

      {!hasFiles && (
        <Card className="overflow-hidden border-2 border-dashed border-border/60 bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <FileUp className="h-8 w-8 text-primary" aria-hidden />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">No files yet</h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Upload your first document or image above to get started. We&apos;ll extract text and
              help you mark important snippets for AI-generated study materials.
            </p>
            <p className="text-xs text-muted-foreground">
              Supported: JPG, PNG, PDF, DOCX (up to 25MB each)
            </p>
          </CardContent>
        </Card>
      )}

      {hasFiles && (
        <>
          <Card className="overflow-hidden border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--peach-light))]/10 to-card">
            <CardHeader>
              <CardTitle>Uploaded files</CardTitle>
              <CardDescription>
                Click a file to view and edit OCR results. Mark important snippets for AI context.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {(allFiles ?? []).map((file) => (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFileId(file.id)}
                    className={cn(
                      'cursor-pointer transition-all duration-200',
                      selectedFileId === file.id &&
                        'ring-2 ring-primary ring-offset-2 rounded-2xl'
                    )}
                  >
                    <FileCard
                      file={file}
                      onRemove={handleRemove}
                      onRetryOcr={handleRetryOcr}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedFile && (
            <Card className="overflow-hidden border-2 border-border/60">
              <CardHeader>
                <CardTitle>OCR results — {selectedFile.name}</CardTitle>
                <CardDescription>
                  Edit text inline and mark snippets as important for AI context.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OCRPanel
                  ocrText={selectedFile.ocrText}
                  snippets={selectedFile.ocrSnippets ?? []}
                  ocrStatus={selectedFile.ocrStatus}
                  onSnippetEdit={handleSnippetEdit}
                  onToggleImportant={handleToggleImportant}
                />
              </CardContent>
            </Card>
          )}

          <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-card">
            <CardHeader>
              <CardTitle>AI context</CardTitle>
              <CardDescription>
                Important snippets you marked will be used to personalize study materials.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SnippetContextChipList
                snippets={allSnippets}
                onRemove={handleRemoveFromContext}
              />
              <PreviewPanel selectedContextSnippets={importantSnippets} />
            </CardContent>
          </Card>

          {onSave && (
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                aria-busy={isSaving}
                aria-label={isSaving ? 'Saving materials…' : 'Save and continue'}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Saving…
                  </>
                ) : (
                  'Save & continue'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
