/**
 * Page P008: File & Study Management
 * Filters, search, share and permissions, integration with study creation.
 */

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  FileText,
  Search,
  Loader2,
  Edit3,
  Download,
  Trash2,
  FolderOpen,
  Plus,
} from 'lucide-react'
import { listFiles, searchFiles, getDownloadUrl, deleteFile } from '@/api/files'
import type { FileMeta } from '@/types/files'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function OcrStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-muted text-muted-foreground',
    in_progress: 'bg-primary/10 text-primary',
    completed: 'bg-green-500/10 text-green-700',
    corrected: 'bg-green-500/10 text-green-700',
    failed: 'bg-destructive/10 text-destructive',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        styles[status] ?? styles.pending
      )}
    >
      {status.replace('_', ' ')}
    </span>
  )
}

export function FileManagementPage() {
  const navigate = useNavigate()
  const [files, setFiles] = useState<FileMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [ocrFilter, setOcrFilter] = useState<string>('')

  const loadFiles = useCallback(async () => {
    setLoading(true)
    try {
      if (searchQuery.trim()) {
        const res = await searchFiles({
          query: searchQuery.trim(),
          ocrStatus: ocrFilter || undefined,
          limit: 50,
        })
        setFiles(res?.data ?? [])
      } else {
        const res = await listFiles({
          limit: 50,
          ocrStatus: ocrFilter || undefined,
        })
        setFiles(res?.data ?? [])
      }
    } catch {
      setFiles([])
      toast.error('Failed to load files')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, ocrFilter])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  const handleDownload = useCallback(
    async (fileId: string) => {
      try {
        const url = await getDownloadUrl(fileId)
        if (url) window.open(url, '_blank')
        else toast.error('Download URL not available')
      } catch {
        toast.error('Failed to get download URL')
      }
    },
    []
  )

  const handleDelete = useCallback(
    async (fileId: string, filename: string) => {
      if (!confirm(`Delete "${filename}"? This cannot be undone.`)) return
      try {
        const res = await deleteFile(fileId)
        if (res?.error) throw new Error(res.error)
        toast.success('File deleted')
        loadFiles()
      } catch (err) {
        toast.error((err as Error).message)
      }
    },
    [loadFiles]
  )

  const fileList = Array.isArray(files) ? files : []

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="container flex max-w-4xl items-center justify-between gap-4">
          <h1 className="text-lg font-semibold">Files & Documents</h1>
          <Button
            size="sm"
            className="rounded-full"
            onClick={() => navigate('/dashboard/upload-ocr')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      <div className="container max-w-4xl py-8">
        <Card className="overflow-hidden border-2 border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              Your files
            </CardTitle>
            <CardDescription>
              Search, filter, and manage uploaded documents. Edit OCR results or use files when
              creating studies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by filename or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadFiles()}
                  className="pl-9 rounded-full"
                />
              </div>
              <select
                value={ocrFilter}
                onChange={(e) => setOcrFilter(e.target.value)}
                className="rounded-full border border-input bg-background px-4 py-2 text-sm"
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="corrected">Corrected</option>
                <option value="failed">Failed</option>
              </select>
              <Button variant="outline" size="sm" onClick={loadFiles} className="rounded-full">
                Search
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : fileList.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 py-16">
                <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
                <p className="font-medium text-foreground">No files yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload documents to get started. OCR will extract text automatically.
                </p>
                <Button
                  className="mt-4 rounded-full"
                  onClick={() => navigate('/dashboard/upload-ocr')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Upload files
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {fileList.map((file) => (
                  <div
                    key={file.id}
                    className={cn(
                      'flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4',
                      'transition-all duration-200 hover:shadow-card'
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{file.filename}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatSize(file.size ?? 0)}</span>
                        <span>•</span>
                        <span>{formatDate(file.createdAt ?? '')}</span>
                        <span>•</span>
                        <OcrStatusBadge status={file.ocrStatus ?? 'pending'} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => navigate(`/dashboard/files/${file.id}/correct`)}
                      >
                        <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                        Edit OCR
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                        onClick={() => handleDownload(file.id)}
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Download
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(file.id, file.filename ?? '')}
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
