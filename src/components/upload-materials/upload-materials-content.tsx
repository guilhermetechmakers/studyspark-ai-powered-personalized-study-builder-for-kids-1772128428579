import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

export interface UploadMaterialsContentProps {
  files?: FileItem[]
  onFilesChange?: (files: FileItem[]) => void
  onSave?: (payload: {
    files: FileItem[]
    importantSnippets: Snippet[]
  }) => void
  className?: string
}

function createMockSnippets(text: string): Snippet[] {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean)
  return sentences.map((s, i) => ({
    id: `snippet-${i}`,
    text: s.trim(),
    confidence: 0.85 + Math.random() * 0.15,
    important: false,
    position: { start: 0, end: s.length },
  }))
}

function simulateOcr(text: string): Snippet[] {
  return createMockSnippets(text || 'Sample extracted text from document. Key concepts and definitions will appear here for AI context.')
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

  const handleFileAdd = useCallback(
    (newFiles: File[]) => {
      const items: FileItem[] = newFiles.map((f, i) => ({
        id: `file-${Date.now()}-${i}`,
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: new Date().toISOString(),
        url: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
        ocrStatus: 'pending' as const,
        ocrSnippets: [],
        file: f,
      }))
      setFiles((prev) => [...prev, ...items])
      setErrors([])

      items.forEach((item) => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, ocrStatus: 'in_progress' as const } : f
          )
        )
        setTimeout(() => {
          const mockText = `Extracted content from ${item.name}. This is sample OCR output. Key terms and definitions would appear here.`
          const snippets = simulateOcr(mockText)
          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? {
                    ...f,
                    ocrStatus: 'complete' as const,
                    ocrText: mockText,
                    ocrSnippets: snippets,
                  }
                : f
            )
          )
          if (!selectedFileId && item.id) setSelectedFileId(item.id)
        }, 1200)
      })
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
    (id: string) => {
      const file = (allFiles ?? []).find((f) => f.id === id)
      if (!file) return

      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, ocrStatus: 'in_progress' as const, ocrSnippets: [] } : f
        )
      )

      setTimeout(() => {
        const mockText = file.ocrText ?? `Retry OCR for ${file.name}. Sample extracted text.`
        const snippets = simulateOcr(mockText)
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? {
                  ...f,
                  ocrStatus: 'complete' as const,
                  ocrText: mockText,
                  ocrSnippets: snippets,
                }
              : f
          )
        )
        toast.success('OCR complete')
      }, 1500)
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

  const handleSave = useCallback(() => {
    const validationErrors: ValidationError[] = []
    if ((allFiles ?? []).length === 0) {
      validationErrors.push({ message: 'Add at least one file before saving.' })
    }
    setErrors(validationErrors)
    if (validationErrors.length > 0) {
      toast.error('Please fix the errors before saving.')
      return
    }
    onSave?.({
      files: allFiles ?? [],
      importantSnippets,
    })
    toast.success('Materials saved!')
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

      <Card className="overflow-hidden border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--lavender))]/10 to-white">
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

      <ValidationSummary errors={errors} />

      {(allFiles ?? []).length > 0 && (
        <>
          <Card className="overflow-hidden border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--peach-light))]/10 to-white">
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

          <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-white">
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
              <button
                type="button"
                onClick={handleSave}
                className="rounded-full bg-primary px-6 py-2.5 font-medium text-primary-foreground shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              >
                Save & continue
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
