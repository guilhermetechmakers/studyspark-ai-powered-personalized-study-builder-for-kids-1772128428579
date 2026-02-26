/**
 * Export Page (page_p008) - Initiate Export (PDF + bundles)
 * Step-by-step UI for configuring exports with paper size, orientation, sections, watermark.
 */

import { useState, useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { FileText, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ExportWizard } from '@/components/export/export-wizard'
import { createExport, listTemplates } from '@/api/exports'
import type { ExportTemplate } from '@/types/exports'
import { toast } from 'sonner'

export function ExportPage() {
  const { id: studyIdParam } = useParams()
  const [searchParams] = useSearchParams()
  const studyIdFromQuery = searchParams.get('studyId')
  const studyId = studyIdParam ?? studyIdFromQuery ?? ''
  const studyTitle = searchParams.get('title') ?? 'Study'

  const [templates, setTemplates] = useState<ExportTemplate[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const list = await listTemplates()
      if (!cancelled) {
        setTemplates(Array.isArray(list) ? list : [])
      }
    }
    load().finally(() => {
      if (!cancelled) setIsLoadingTemplates(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleExport = async (opts: {
    exportType: 'pdf' | 'bundle'
    paperSize: 'A4' | 'Letter' | 'Legal'
    orientation: 'portrait' | 'landscape'
    include: { studySheet?: boolean; flashcards?: boolean; answers?: boolean; notes?: boolean }
    watermark: boolean
  }) => {
    if (!studyId) {
      toast.error('No study selected')
      return
    }
    setIsExporting(true)
    try {
      const result = await createExport({
        studyId,
        exportType: opts.exportType,
        paperSize: opts.paperSize,
        orientation: opts.orientation,
        include: opts.include,
        watermark: opts.watermark,
      })
      if (result?.jobId) {
        toast.success('Export generated successfully')
        window.location.href = `/dashboard/export-progress?jobId=${result.jobId}`
      } else {
        toast.error('Export failed')
      }
    } catch (err) {
      toast.error((err as Error).message ?? 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/studies">
            <ArrowLeft className="h-5 w-5" aria-label="Back to library" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Export & Print</h1>
          <p className="text-muted-foreground">
            Generate printable PDFs or asset bundles for your study
          </p>
        </div>
      </div>

      {!studyId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(var(--peach-light))] to-[rgb(var(--lavender))]/30">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Select a study to export
            </h3>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              Choose a study from the library to generate a printable export or asset bundle.
            </p>
            <Button className="mt-6" asChild>
              <Link to="/dashboard/studies">Go to Study Library</Link>
            </Button>
          </CardContent>
        </Card>
      ) : isLoadingTemplates ? (
        <Card>
          <CardContent className="p-6">
            <Skeleton className="mb-4 h-8 w-48" />
            <Skeleton className="mb-4 h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      ) : (
        <ExportWizard
          studyId={studyId}
          studyTitle={studyTitle}
          templates={templates}
          onExport={handleExport}
          isExporting={isExporting}
        />
      )}
    </div>
  )
}
