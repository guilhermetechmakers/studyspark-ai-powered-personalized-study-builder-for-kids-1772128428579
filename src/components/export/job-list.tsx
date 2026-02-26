/**
 * JobList - List of active/completed export jobs with actions
 */

import { ProgressPanel } from '@/components/export/progress-panel'
import { DownloadCard } from '@/components/export/download-card'
import type { ExportJobListItem, ExportJobStatus } from '@/types/exports'
import { cn } from '@/lib/utils'

export interface JobListProps {
  jobs: ExportJobListItem[]
  onDownload: (jobId: string) => void
  downloadingJobId?: string | null
  className?: string
}

export function JobList({
  jobs,
  onDownload,
  downloadingJobId = null,
  className,
}: JobListProps) {
  const items = Array.isArray(jobs) ? jobs : []

  if (items.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-16',
          className
        )}
      >
        <p className="text-sm font-medium text-muted-foreground">
          No exports yet
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Create an export from a study to see it here
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {items.map((job) => {
        const isCompleted = job.status === 'completed'
        const isDownloading = downloadingJobId === job.id

        if (isCompleted) {
          return (
            <DownloadCard
              key={job.id}
              title={job.studyTitle || `Export ${job.id.slice(0, 8)}`}
              type={job.exportType}
              createdAt={job.createdAt}
              onDownload={() => onDownload(job.id)}
              isDownloading={isDownloading}
            />
          )
        }

        return (
          <ProgressPanel
            key={job.id}
            jobId={job.id}
            status={job.status as ExportJobStatus}
            progress={job.progress}
            resultUrl={job.resultUrl}
            error={job.error}
            onDownload={job.status === 'completed' ? () => onDownload(job.id) : undefined}
          />
        )
      })}
    </div>
  )
}
