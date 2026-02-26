/**
 * page_p006: File Upload & OCR Ingestion
 * Main interface: upload area, status dashboard, OCR progress.
 */

import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UploadDropzone } from '@/components/files/upload-dropzone'
import { FileUploadCard } from '@/components/files/file-upload-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, ArrowRight } from 'lucide-react'
import { useFileUpload } from '@/hooks/use-file-upload'
import { listFiles, getDownloadUrl, deleteFile } from '@/api/files'
import type { UploadedFile } from '@/types/files'
import { dataGuard } from '@/lib/data-guard'

export function PageP006UploadOcr() {
  const navigate = useNavigate()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(true)
  const { uploading, uploadedIds, uploadFiles, clearUploading } = useFileUpload()

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await listFiles({ limit: 50 })
      setFiles(data ?? [])
    } catch {
      setFiles([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  useEffect(() => {
    if (uploadedIds.length > 0) {
      fetchFiles()
      clearUploading()
    }
  }, [uploadedIds, fetchFiles, clearUploading])

  const handleFilesAdd = useCallback(
    async (newFiles: File[]) => {
      if ((newFiles ?? []).length === 0) return
      await uploadFiles(newFiles)
      toast.success(`${newFiles.length} file(s) uploaded. OCR processing started.`)
    },
    [uploadFiles]
  )

  const handleDownload = useCallback(async (id: string) => {
    try {
      const url = await getDownloadUrl(id)
      if (url) window.open(url, '_blank')
      else toast.error('Could not get download link')
    } catch {
      toast.error('Download failed')
    }
  }, [])

  const handleEdit = useCallback(
    (id: string) => {
      navigate(`/dashboard/files/${id}/correct`)
    },
    [navigate]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm('Delete this file?')) return
      try {
        const res = await deleteFile(id)
        if (res?.ok) {
          setFiles((prev) => (prev ?? []).filter((f) => f.id !== id))
          toast.success('File deleted')
        } else {
          toast.error(res?.error ?? 'Delete failed')
        }
      } catch {
        toast.error('Delete failed')
      }
    },
    []
  )

  const safeFiles = dataGuard(files)
  const hasUploading = uploading.length > 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl space-y-8 py-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Upload & OCR
          </h1>
          <p className="text-muted-foreground">
            Upload documents and photos. We&apos;ll extract text automatically and let you review or correct the results.
          </p>
        </div>

        <Card className="overflow-hidden border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--lavender))]/10 to-white">
          <CardHeader>
            <CardTitle>Add files</CardTitle>
            <CardDescription>
              Drag and drop or click to browse. Supports JPG, PNG, PDF, DOCX up to 25MB.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadDropzone onFilesAdd={handleFilesAdd} disabled={hasUploading} />
          </CardContent>
        </Card>

        {hasUploading && (
          <Card className="overflow-hidden border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Uploading...
              </CardTitle>
              <CardDescription>
                Files are being uploaded and processed. OCR will start automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(uploading ?? []).map((u, i) => (
                <div key={i} className="animate-fade-in-up">
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
                    <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{u.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {u.status === 'uploading' && `${u.progress}% uploaded`}
                        {u.status === 'completing' && 'Processing...'}
                        {u.status === 'done' && 'Complete'}
                        {u.status === 'error' && u.error}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="overflow-hidden border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--peach-light))]/10 to-white">
          <CardHeader>
            <CardTitle>Your files</CardTitle>
            <CardDescription>
              Click a file to download, edit OCR, or delete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                ))}
              </div>
            ) : safeFiles.length === 0 && !hasUploading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 text-center">
                <FileText className="mb-4 h-16 w-16 text-muted-foreground/50" />
                <p className="font-medium text-muted-foreground">No files yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload your first document or photo to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {safeFiles.map((file) => (
                  <FileUploadCard
                    key={file.id}
                    file={file}
                    onDownload={handleDownload}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            variant="default"
            className="rounded-full"
            onClick={() => navigate('/dashboard/files')}
          >
            Manage files
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
