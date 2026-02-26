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
  Filter,
  Upload,
  Eye,
  Edit3,
  Loader2,
  FileImage,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { searchFiles, getFile } from '@/api/files'
import type { FileMeta } from '@/types/files'
import { dataGuard } from '@/lib/data-guard'

export function FileStudyManagementPage() {
  const navigate = useNavigate()
  const [files, setFiles] = useState<FileMeta[]>([])
  const [query, setQuery] = useState('')
  const [ocrFilter, setOcrFilter] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  const loadFiles = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await searchFiles({
        query: query || undefined,
        ocrStatus: ocrFilter || undefined,
        limit: 50,
      })
      const items = Array.isArray(res?.data) ? res.data : []
      setFiles(items)
    } catch (err) {
      toast.error((err as Error)?.message ?? 'Failed to load files')
      setFiles([])
    } finally {
      setIsLoading(false)
    }
  }, [query, ocrFilter])

  useEffect(() => {
    let cancelled = false
    const t = setTimeout(() => {
      if (!cancelled) {
        loadFiles()
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [loadFiles])

  const handleOpenFile = useCallback(
    (f: FileMeta) => {
      navigate(`/dashboard/ocr-correction-review?fileId=${f.id}`)
    },
    [navigate]
  )

  const handleDownload = useCallback(async (f: FileMeta) => {
    try {
      const { downloadUrl } = await getFile(f.id)
      if (downloadUrl) {
        window.open(downloadUrl, '_blank')
      } else {
        toast.error('Download not available')
      }
    } catch (err) {
      toast.error((err as Error)?.message ?? 'Download failed')
    }
  }, [])

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return ''
    }
  }

  const statusColor = (s: string) => {
    switch (s) {
      case 'completed':
      case 'corrected':
      case 'complete':
        return 'bg-green-500/10 text-green-700 dark:text-green-400'
      case 'in_progress':
        return 'bg-primary/10 text-primary'
      case 'failed':
        return 'bg-destructive/10 text-destructive'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="container flex max-w-6xl items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            Back
          </Button>
          <h1 className="text-lg font-semibold">File & Study Management</h1>
          <Button
            size="sm"
            onClick={() => navigate('/dashboard/upload-materials')}
            className="rounded-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      <div className="container max-w-6xl py-8">
        <div className="space-y-6 animate-fade-in">
          <Card className="overflow-hidden border-2 border-border bg-gradient-to-br from-[rgb(var(--peach-light))]/10 to-white">
            <CardHeader>
              <CardTitle>Search & filter</CardTitle>
              <CardDescription>
                Find files by name or OCR text. Filter by OCR status.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 rounded-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
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
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden />
            </div>
          ) : dataGuard(files).length === 0 ? (
            <Card className="overflow-hidden border-2 border-dashed border-border">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
                <p className="font-medium text-foreground">No files yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload documents to get started. OCR will extract text automatically.
                </p>
                <Button
                  className="mt-4 rounded-full"
                  onClick={() => navigate('/dashboard/upload-materials')}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload files
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(files ?? []).map((f) => (
                <Card
                  key={f.id}
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    'hover:shadow-card-hover hover:-translate-y-0.5',
                    'cursor-pointer border-2 border-border'
                  )}
                  onClick={() => handleOpenFile(f)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        {f.mimeType?.startsWith('image/') ? (
                          <FileImage className="h-8 w-8 text-primary" />
                        ) : (
                          <FileText className="h-8 w-8 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{f.filename}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatSize(f.size ?? 0)}</span>
                          <span>•</span>
                          <span>{formatDate(f.createdAt ?? '')}</span>
                        </div>
                        <span
                          className={cn(
                            'mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                            statusColor(f.ocrStatus ?? '')
                          )}
                        >
                          {f.ocrStatus ?? 'pending'}
                        </span>
                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-full text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenFile(f)
                            }}
                          >
                            <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-full text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownload(f)
                            }}
                          >
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
