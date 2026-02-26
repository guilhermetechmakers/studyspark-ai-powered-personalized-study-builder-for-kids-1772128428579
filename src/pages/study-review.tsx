import { useState, useCallback, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  fetchStudyReview,
  saveDraft,
  submitRevision,
  approveStudy,
  exportStudy,
  shareStudy,
  restoreVersion,
  duplicateStudy,
} from '@/api/study-review'
import type {
  Study,
  SectionBlock,
  SectionContent,
  AIInteractionEntry,
  Version,
  SourceReference,
} from '@/types/study-review'
import { dataGuard } from '@/lib/data-guard'
import { StudySectionEditor } from '@/components/study-review/study-section-editor'
import { RevisionPanel } from '@/components/study-review/revision-panel'
import { VersionHistoryPanel } from '@/components/study-review/version-history-panel'
import { SourceReferencesPanel } from '@/components/study-review/source-references-panel'
import { ExportSharePanel } from '@/components/study-review/export-share-panel'
import { QuickActionsBar } from '@/components/study-review/quick-actions-bar'
import { SECTION_TYPE_LABELS } from '@/types/study-review'
import { getMockStudyReview } from '@/data/study-review-mock'

export function StudyReviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const studyId = id ?? ''

  const [study, setStudy] = useState<Study | null>(null)
  const [studyData, setStudyData] = useState<SectionBlock[]>([])
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null)
  const [sourceReferences, setSourceReferences] = useState<SourceReference[]>([])
  const [versionHistory, setVersionHistory] = useState<Version[]>([])
  const [aiInteractionHistory, setAiInteractionHistory] = useState<AIInteractionEntry[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  const safeSections = dataGuard(studyData)
  const sortedSections = [...safeSections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const currentSection = sortedSections.find((s) => s.id === currentSectionId) ?? sortedSections[0] ?? null

  const draftTextPreview = currentSection
    ? typeof currentSection.content === 'string'
      ? String(currentSection.content).slice(0, 100)
      : JSON.stringify(currentSection.content ?? {}).slice(0, 100)
    : ''
  const completionPercent = safeSections.length > 0 ? Math.min(100, (safeSections.filter((s) => (s.content && (typeof s.content === 'string' ? s.content.trim() : JSON.stringify(s.content)) !== '{}')).length / safeSections.length) * 100) : 0

  const loadStudy = useCallback(async () => {
    if (!studyId) return
    setIsLoading(true)
    try {
      const data = await fetchStudyReview(studyId)
      setStudy(data.study)
      setStudyData(Array.isArray(data.sections) ? data.sections : [])
      setSourceReferences(Array.isArray(data.references) ? data.references : [])
      setVersionHistory(Array.isArray(data.versions) ? data.versions : [])
      setAiInteractionHistory(Array.isArray(data.revisions) ? data.revisions.map((r) => ({ id: r.id, blockId: r.blockId, prompt: r.prompt, aiResponse: r.aiResponse, timestamp: r.createdAt, status: r.status })) : [])
      const first = (data.sections ?? [])[0]
      setCurrentSectionId(first?.id ?? null)
    } catch {
      const mock = getMockStudyReview(studyId)
      setStudy(mock.study)
      setStudyData(mock.sections ?? [])
      setSourceReferences(mock.references ?? [])
      setVersionHistory(mock.versions ?? [])
      setAiInteractionHistory([])
      const first = (mock.sections ?? [])[0]
      setCurrentSectionId(first?.id ?? null)
      toast.info('Using demo data. Connect API for real data.')
    } finally {
      setIsLoading(false)
    }
  }, [studyId])

  useEffect(() => {
    loadStudy()
  }, [loadStudy])

  const handleUpdateSection = useCallback((sectionId: string, content: string | SectionContent | Record<string, unknown>) => {
    setStudyData((prev) => {
      const list = prev ?? []
      const idx = list.findIndex((s) => s.id === sectionId)
      if (idx < 0) return list
      const next = [...list]
      next[idx] = { ...next[idx]!, content }
      return next
    })
  }, [])

  const handleSaveDraft = useCallback(async () => {
    if (!studyId) return
    setIsSaving(true)
    try {
      await saveDraft(studyId, { blocks: studyData })
      toast.success('Draft saved')
    } catch {
      toast.error('Failed to save draft')
    } finally {
      setIsSaving(false)
    }
  }, [studyId, studyData])

  const handleApprove = useCallback(async () => {
    if (!studyId) return
    setIsApproving(true)
    try {
      await saveDraft(studyId, { blocks: studyData })
      await approveStudy(studyId)
      toast.success('Study approved')
      setStudy((s) => (s ? { ...s, status: 'approved' } : null))
    } catch {
      toast.error('Failed to approve')
    } finally {
      setIsApproving(false)
    }
  }, [studyId, studyData])

  const handleDuplicate = useCallback(async () => {
    if (!studyId) return
    setIsDuplicating(true)
    try {
      const dup = await duplicateStudy(studyId)
      toast.success('Study duplicated')
      if (dup?.id) navigate(`/dashboard/studies/${dup.id}`)
    } catch {
      toast.error('Failed to duplicate')
    } finally {
      setIsDuplicating(false)
    }
  }, [studyId, navigate])

  const handleExport = useCallback(async (format: 'pdf' | 'zip') => {
    if (!studyId) return
    setIsExporting(true)
    try {
      const { url } = await exportStudy(studyId, format)
      if (url) {
        window.open(url, '_blank')
        toast.success('Export started')
      } else {
        toast.success('Export requested')
      }
    } catch {
      toast.error('Export failed')
    } finally {
      setIsExporting(false)
    }
  }, [studyId])

  const handleShare = useCallback(async (method: 'link' | 'email', email?: string) => {
    if (!studyId) return
    setIsSharing(true)
    try {
      const res = await shareStudy(studyId, { method, email })
      if (method === 'link' && res?.link) {
        await navigator.clipboard.writeText(res.link)
        toast.success('Share link copied to clipboard')
      } else if (method === 'email' && res?.emailSent) {
        toast.success('Email sent')
      } else {
        toast.success('Share link generated')
      }
    } catch {
      toast.error('Share failed')
    } finally {
      setIsSharing(false)
    }
  }, [studyId])

  const handleSubmitRevision = useCallback(async (blockId: string, prompt: string, notes?: string) => {
    if (!studyId) return
    setIsSubmittingRevision(true)
    try {
      const rev = await submitRevision(studyId, { blockId, prompt, notes })
      setAiInteractionHistory((prev) => [
        ...(prev ?? []),
        { id: rev.id, blockId, prompt, aiResponse: rev.aiResponse, timestamp: rev.createdAt, status: rev.status },
      ])
      if (rev.aiResponse) {
        setStudyData((prev) => {
          const list = prev ?? []
          const idx = list.findIndex((s) => s.id === blockId)
          if (idx < 0) return list
          const next = [...list]
          next[idx] = { ...next[idx]!, content: rev.aiResponse ?? next[idx]!.content }
          return next
        })
      }
      toast.success('Revision submitted')
    } catch {
      toast.error('Revision failed')
    } finally {
      setIsSubmittingRevision(false)
    }
  }, [studyId])

  const handleRestoreVersion = useCallback(async (versionId: string) => {
    if (!studyId) return
    setIsRestoring(true)
    try {
      await restoreVersion(studyId, versionId)
      await loadStudy()
      toast.success('Version restored')
    } catch {
      toast.error('Restore failed')
    } finally {
      setIsRestoring(false)
    }
  }, [studyId, loadStudy])

  if (!studyId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Invalid study ID</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <header
        className="flex shrink-0 items-center justify-between border-b border-border bg-card px-6 py-4"
        role="banner"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard/studies" aria-label="Back to studies">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {(study?.title ?? 'S').charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold text-foreground">{study?.title ?? 'Untitled Study'}</h1>
            <p className="text-sm text-muted-foreground">
              {study?.status ?? 'draft'} · {safeSections.length} sections
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden w-48 sm:block">
            <p className="text-xs font-medium text-muted-foreground">Progress</p>
            <Progress value={completionPercent} className="h-2" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={cn(
            'flex shrink-0 flex-col border-r border-border bg-card transition-all duration-300',
            sidebarCollapsed ? 'w-14' : 'w-56'
          )}
        >
          <div className="flex items-center justify-between border-b border-border p-3">
            {!sidebarCollapsed && <span className="text-sm font-medium">Sections</span>}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          <ScrollArea className="flex-1 py-2">
            <nav className="space-y-1 px-2" aria-label="Study sections">
              {(sortedSections ?? []).map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setCurrentSectionId(section.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors',
                    currentSectionId === section.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    sidebarCollapsed && 'justify-center px-2'
                  )}
                  aria-current={currentSectionId === section.id ? 'true' : undefined}
                >
                  <span className="shrink-0">
                    {SECTION_TYPE_LABELS[section.type as keyof typeof SECTION_TYPE_LABELS] ?? section.type}
                  </span>
                </button>
              ))}
            </nav>
          </ScrollArea>
        </aside>

        <main className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col overflow-auto p-6">
            <div className="mx-auto max-w-3xl">
              {currentSection ? (
                <StudySectionEditor
                  key={currentSection.id}
                  sectionId={currentSection.id}
                  sectionData={currentSection}
                  onUpdateSection={handleUpdateSection}
                  className="animate-fade-in"
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
                  <p className="text-muted-foreground">
                    {safeSections.length === 0 ? 'No sections yet.' : 'Select a section to edit.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="hidden w-80 shrink-0 flex-col gap-4 overflow-auto border-l border-border bg-background p-4 lg:flex">
            <RevisionPanel
              selectedBlock={currentSection}
              draftText={draftTextPreview}
              onSubmitRevision={handleSubmitRevision}
              revisionsHistory={aiInteractionHistory}
              isSubmitting={isSubmittingRevision}
            />
            <VersionHistoryPanel
              versions={versionHistory}
              onRestoreVersion={handleRestoreVersion}
              isRestoring={isRestoring}
            />
            <SourceReferencesPanel references={sourceReferences} />
            <ExportSharePanel
              studyData={studyData}
              onExport={handleExport}
              onShare={handleShare}
              isExporting={isExporting}
              isSharing={isSharing}
            />
          </aside>
        </main>
      </div>

      <QuickActionsBar
        onApprove={handleApprove}
        onSaveDraft={handleSaveDraft}
        onDuplicate={handleDuplicate}
        onExport={() => handleExport('pdf')}
        onShare={() => handleShare('link')}
        isApproving={isApproving}
        isSaving={isSaving}
        isDuplicating={isDuplicating}
        isExporting={isExporting}
      />
      <div className="h-20 shrink-0" aria-hidden />
    </div>
  )
}
