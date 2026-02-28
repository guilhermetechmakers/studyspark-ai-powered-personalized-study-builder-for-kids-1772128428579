/**
 * page_p008: File & Study Management
 * Filters, search, share and permissions, integration with study creation.
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FileUploadCard } from '@/components/files/file-upload-card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Upload, FileText, FilterX } from 'lucide-react'
import { searchFiles, listFiles, getDownloadUrl, deleteFile } from '@/api/files'
import type { UploadedFile } from '@/types/files'
import { dataGuard } from '@/lib/data-guard'

/** Use '_all' for "no filter" - Radix Select requires non-empty value prop */
const OCR_STATUS_ALL = '_all'

const OCR_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: OCR_STATUS_ALL, label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'corrected', label: 'Corrected' },
]

export function PageP008FileManagement() {
  const navigate = useNavigate()
  const location = useLocation()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [ocrStatusFilter, setOcrStatusFilter] = useState<string>(OCR_STATUS_ALL)
  const hasShownUploadToast = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    const state = location.state as { uploaded?: boolean } | null
    if (state?.uploaded && !hasShownUploadToast.current) {
      hasShownUploadToast.current = true
      toast.success('Files uploaded successfully. OCR processing has started.')
      navigate(location.pathname, { replace: true })
    }
  }, [location.state, location.pathname, navigate])

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    try {
      if (debouncedQuery.trim()) {
        const { data } = await searchFiles({
          query: debouncedQuery.trim(),
          ocrStatus: ocrStatusFilter === OCR_STATUS_ALL ? undefined : ocrStatusFilter,
          limit: 50,
        })
        setFiles(data ?? [])
      } else {
        const { data } = await listFiles({
          limit: 50,
          ocrStatus: ocrStatusFilter === OCR_STATUS_ALL ? undefined : ocrStatusFilter,
        })
        setFiles(data ?? [])
      }
    } catch {
      setFiles([])
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery, ocrStatusFilter])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

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
      setDeletingId(id)
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
      } finally {
        setDeletingId(null)
      }
    },
    []
  )

  const handleClearFilters = useCallback(() => {
    setQuery('')
    setOcrStatusFilter(OCR_STATUS_ALL)
  }, [])

  const safeFiles = dataGuard(files)

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl space-y-8 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              File & Study Management
            </h1>
            <p className="mt-1 text-muted-foreground">
              Search, filter, and manage your uploaded files. Use them when creating studies.
            </p>
          </div>
          <Button
            className="rounded-full"
            onClick={() => navigate('/dashboard/upload-ocr')}
            aria-label="Upload new files to manage"
          >
            <Upload className="mr-2 h-4 w-4" aria-hidden />
            Upload files
          </Button>
        </div>

        <Card className="overflow-hidden border-2 border-border/60">
          <CardHeader>
            <CardTitle>Search & filters</CardTitle>
            <CardDescription>
              Search by filename or OCR text. Filter by status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  placeholder="Search files..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                  aria-label="Search files by filename or OCR text"
                />
              </div>
              <Select value={ocrStatusFilter} onValueChange={setOcrStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 rounded-xl" aria-label="Filter by OCR status">
                  <SelectValue placeholder="OCR status" />
                </SelectTrigger>
                <SelectContent>
                  {OCR_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--peach-light))]/10 to-card">
          <CardHeader>
            <CardTitle>Your files</CardTitle>
            <CardDescription>
              {safeFiles.length} file(s) found. Click to download, edit OCR, or delete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                ))}
              </div>
            ) : safeFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 text-center">
                <FileText className="mb-4 h-16 w-16 text-muted-foreground/50" aria-hidden />
                <p className="font-medium text-muted-foreground">No files found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {debouncedQuery || ocrStatusFilter !== OCR_STATUS_ALL
                    ? 'Try adjusting your search or filters.'
                    : 'Upload files to get started.'}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  {(debouncedQuery || ocrStatusFilter !== OCR_STATUS_ALL) && (
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={handleClearFilters}
                      aria-label="Clear search and filters"
                    >
                      <FilterX className="mr-2 h-4 w-4" aria-hidden />
                      Clear filters
                    </Button>
                  )}
                  <Button
                    variant={debouncedQuery || ocrStatusFilter !== OCR_STATUS_ALL ? 'outline' : 'default'}
                    className="rounded-full"
                    onClick={() => navigate('/dashboard/upload-ocr')}
                    aria-label="Upload new files"
                  >
                    <Upload className="mr-2 h-4 w-4" aria-hidden />
                    Upload files
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {safeFiles.map((file) => (
                  <FileUploadCard
                    key={file.id}
                    file={file}
                    onDownload={handleDownload}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isDeleting={deletingId === file.id}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
