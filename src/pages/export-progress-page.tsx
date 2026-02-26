/**
 * Export Progress Page (page_p011) - Track Exports & Download
 * Progress dashboard, status, and access to download links.
 */

import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Download,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  FileArchive,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  listExports,
  getExportStatus,
  downloadExport,
} from '@/api/exports'
import type { ExportJobListItem } from '@/types/exports'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const POLL_INTERVAL_MS = 2000

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString()
  } catch {
    return ''
  }
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />
    case 'failed':
    case 'cancelled':
      return <XCircle className="h-5 w-5 text-destructive" />
    case 'processing':
    case 'rendering':
    case 'queued':
      return <Loader2 className="h-5 w-5 animate-spin text-primary" />
    default:
      return <Clock className="h-5 w-5 text-muted-foreground" />
  }
}

export function ExportProgressPage() {
  const [searchParams] = useSearchParams()
  const jobIdFromUrl = searchParams.get('jobId')

  const [jobs, setJobs] = useState<ExportJobListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeJobId, setActiveJobId] = useState<string | null>(jobIdFromUrl)
  const [activeProgress, setActiveProgress] = useState(0)
  const [isDownloading, setIsDownloading] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const { data } = await listExports(50, 0)
      if (!cancelled) {
        setJobs(data ?? [])
      }
    }
    load().finally(() => {
      if (!cancelled) setIsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (jobIdFromUrl) setActiveJobId(jobIdFromUrl)
  }, [jobIdFromUrl])

  useEffect(() => {
    if (!activeJobId) return
    const job = jobs.find((j) => j.id === activeJobId)
    if (job?.status === 'completed' || job?.status === 'failed') return

    const poll = async () => {
      const status = await getExportStatus(activeJobId)
      if (status) {
        setActiveProgress(status.progress ?? 0)
        if (status.status === 'completed' || status.status === 'failed') {
          const { data } = await listExports(50, 0)
          setJobs(data ?? [])
        }
      }
    }

    poll()
    const id = setInterval(poll, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [activeJobId, jobs])

  const handleDownload = async (jobId: string) => {
    setIsDownloading(jobId)
    try {
      const blob = await downloadExport(jobId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `studyspark-export-${jobId.slice(0, 8)}.html`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Download started')
    } catch (err) {
      toast.error((err as Error).message ?? 'Download failed')
    } finally {
      setIsDownloading(null)
    }
  }

  const jobList = jobs ?? []
  const activeJob = activeJobId
    ? jobList.find((j) => j.id === activeJobId)
    : jobList[0]

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Export History & Downloads
          </h1>
          <p className="text-muted-foreground">
            Track export progress and download your files
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/export">
            <FileText className="mr-2 h-4 w-4" />
            New Export
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="mb-4 h-6 w-48" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : jobList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(var(--peach-light))] to-[rgb(var(--lavender))]/30">
              <FileArchive className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              No exports yet
            </h3>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              Create your first export from the Study Library or a study detail page.
            </p>
            <Button className="mt-6" asChild>
              <Link to="/dashboard/studies">Go to Study Library</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeJob && (
            <Card className="border-primary/20 bg-gradient-to-br from-[rgb(var(--peach-light))]/20 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <StatusIcon status={activeJob.status} />
                  {activeJob.studyTitle || 'Export'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(activeJob.status === 'processing' ||
                  activeJob.status === 'rendering' ||
                  activeJob.status === 'queued') && (
                  <div className="space-y-2">
                    <Progress
                      value={activeProgress}
                      className="h-2"
                    />
                    <p className="text-sm text-muted-foreground">
                      {activeJob.status === 'queued'
                        ? 'Queued...'
                        : activeJob.status === 'rendering'
                          ? 'Rendering...'
                          : 'Processing...'}
                    </p>
                  </div>
                )}
                {activeJob.status === 'completed' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      onClick={() => handleDownload(activeJob.id)}
                      disabled={isDownloading === activeJob.id}
                    >
                      {isDownloading === activeJob.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Download
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatDate(activeJob.createdAt)} · {activeJob.paperSize}{' '}
                  {activeJob.orientation}
                </p>
              </CardContent>
            </Card>
          )}

          <div>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">
              All exports
            </h2>
            <div className="space-y-2">
              {jobList.map((job) => (
                <Card
                  key={job.id}
                  className={cn(
                    'transition-colors',
                    activeJobId === job.id && 'ring-2 ring-primary/30'
                  )}
                >
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                    <div
                      className="flex cursor-pointer items-center gap-3"
                      onClick={() => setActiveJobId(job.id)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && setActiveJobId(job.id)
                      }
                      role="button"
                      tabIndex={0}
                    >
                      <StatusIcon status={job.status} />
                      <div>
                        <p className="font-medium">
                          {job.studyTitle || 'Export'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(job.createdAt)} · {job.exportType}
                        </p>
                      </div>
                    </div>
                    {job.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(job.id)}
                        disabled={isDownloading === job.id}
                      >
                        {isDownloading === job.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
