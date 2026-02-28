import { useState, useCallback, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  fetchStudyReviewFromSupabase,
  saveBlock,
  saveDraftToSupabase,
  saveDraftSupabaseAlias as saveDraftSupabase,
  submitRevisionWithContext,
  resolveConflict,
  logConflict,
} from '@/api/study-review-supabase'
import type {
  Study,
  SectionBlock,
  SectionContent,
  AIInteractionEntry,
  Version,
  SourceReference,
  AutosaveStatus,
  UserRole,
} from '@/types/study-review'
import { dataGuard } from '@/lib/data-guard'
import { useDebouncedCallback } from '@/hooks/use-debounce'
import {
  StudySectionEditor,
  RevisionPanel,
  RevisionRequestModal,
  VersionHistoryPanel,
  SourceReferencesPanel,
  ExportSharePanel,
  QuickActionsBar,
  AutosaveIndicator,
  ConflictIndicator,
  PermissionsBadge,
  PreviewPane,
} from '@/components/study-review'
import { SECTION_TYPE_LABELS } from '@/types/study-review'
import { getMockStudyReview } from '@/data/study-review-mock'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''
const useSupabase = !!SUPABASE_URL

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
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('idle')
  const [hasConflict, setHasConflict] = useState(false)
  const [revisionModalOpen, setRevisionModalOpen] = useState(false)
  const [selectedRevisionBlockIds, setSelectedRevisionBlockIds] = useState<string[]>([])
  const userRole: UserRole = 'parent'
  const lastSavedRef = useRef<SectionBlock[]>([])

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
    setHasConflict(false)
    try {
      if (useSupabase) {
        try {
          const data = await fetchStudyReviewFromSupabase(studyId)
          setStudy(data.study)
          setStudyData(Array.isArray(data.sections) ? data.sections : [])
          setSourceReferences(Array.isArray(data.references) ? data.references : [])
          setVersionHistory(Array.isArray(data.versions) ? data.versions : [])
          setAiInteractionHistory(Array.isArray(data.revisions) ? data.revisions.map((r: { id: string; blockId?: string; prompt: string; aiResponse: string | null; createdAt: string; status: string }) => ({ id: r.id, blockId: r.blockId ?? '', prompt: r.prompt, aiResponse: r.aiResponse, timestamp: r.createdAt, status: r.status as AIInteractionEntry['status'] })) : [])
          lastSavedRef.current = Array.isArray(data.sections) ? data.sections : []
          const first = (data.sections ?? [])[0]
          setCurrentSectionId(first?.id ?? null)
          return
        } catch {
          // Fall through to API/mock
        }
      }
      const data = await fetchStudyReview(studyId)
      setStudy(data.study)
      setStudyData(Array.isArray(data.sections) ? data.sections : [])
      setSourceReferences(Array.isArray(data.references) ? data.references : [])
      setVersionHistory(Array.isArray(data.versions) ? data.versions : [])
      setAiInteractionHistory(Array.isArray(data.revisions) ? data.revisions.map((r: { id: string; blockId?: string; prompt: string; aiResponse: string | null; createdAt: string; status: string }) => ({ id: r.id, blockId: r.blockId ?? '', prompt: r.prompt, aiResponse: r.aiResponse, timestamp: r.createdAt, status: r.status as AIInteractionEntry['status'] })) : [])
      lastSavedRef.current = Array.isArray(data.sections) ? data.sections : []
      const first = (data.sections ?? [])[0]
      setCurrentSectionId(first?.id ?? null)
    } catch {
      const mock = getMockStudyReview(studyId)
      setStudy(mock.study)
      setStudyData(mock.sections ?? [])
      setSourceReferences(mock.references ?? [])
      setVersionHistory(mock.versions ?? [])
      setAiInteractionHistory([])
      lastSavedRef.current = mock.sections ?? []
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

  const performSave = useCallback(async () => {
    if (!studyId) return
    setAutosaveStatus('saving')
    try {
      if (useSupabase) {
        const { ok, versionMismatch } = await saveDraftToSupabase(studyId, studyData)
        if (versionMismatch) {
          setHasConflict(true)
          setAutosaveStatus('error')
          await logConflict(studyId, { reason: 'version_mismatch' } as Record<string, unknown>)
          return
        }
        if (ok) {
          lastSavedRef.current = [...studyData]
          setAutosaveStatus('saved')
          setTimeout(() => setAutosaveStatus('idle'), 2000)
        } else {
          setAutosaveStatus('error')
        }
      } else {
        await saveDraft(studyId, { blocks: studyData })
        lastSavedRef.current = [...studyData]
        setAutosaveStatus('saved')
        setTimeout(() => setAutosaveStatus('idle'), 2000)
        toast.success('Draft saved')
      }
    } catch {
      setAutosaveStatus('error')
      if (!useSupabase) toast.error('Failed to save draft')
    }
  }, [studyId, studyData])

  const debouncedSave = useDebouncedCallback(performSave, 20000)

  useEffect(() => {
    if (studyData.length > 0 && JSON.stringify(studyData) !== JSON.stringify(lastSavedRef.current)) {
      debouncedSave()
    }
  }, [studyData, debouncedSave])

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

  const handleBlockBlur = useCallback(
    async (sectionId: string, content: string | SectionContent | Record<string, unknown>) => {
      if (!studyId || !useSupabase) return
      setAutosaveStatus('saving')
      try {
        const { ok, versionMismatch } = await saveBlock(
          studyId,
          sectionId,
          typeof content === 'string' ? content : (content as Record<string, unknown>)
        )
        if (versionMismatch) {
          setHasConflict(true)
          setAutosaveStatus('error')
          return
        }
        if (ok) {
          setStudyData((prev) => {
            const list = prev ?? []
            const idx = list.findIndex((s) => s.id === sectionId)
            if (idx < 0) return list
            const next = [...list]
            next[idx] = { ...next[idx]!, content }
            lastSavedRef.current = next
            return next
          })
          setAutosaveStatus('saved')
          setTimeout(() => setAutosaveStatus('idle'), 2000)
        }
      } catch {
        setAutosaveStatus('error')
      }
    },
    [studyId]
  )

  const handleSaveDraft = useCallback(async () => {
    if (!studyId) return
    setIsSaving(true)
    try {
      if (useSupabase) {
        const { ok } = await saveDraftSupabase(studyId, studyData)
        if (ok) {
          lastSavedRef.current = [...studyData]
          toast.success('Draft saved')
        } else {
          toast.error('Failed to save draft')
        }
      } else {
        await saveDraft(studyId, { blocks: studyData })
        toast.success('Draft saved')
      }
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

  const handleSubmitRevisionWithContext = useCallback(
    async (payload: { blockIds: string[]; prompt: string; intent?: string; notes?: string }) => {
      if (!studyId) return
      setIsSubmittingRevision(true)
      try {
        if (useSupabase) {
          const rev = await submitRevisionWithContext(studyId, payload)
          setAiInteractionHistory((prev) => [
            ...(prev ?? []),
            {
              id: rev.id,
              blockId: payload.blockIds[0] ?? '',
              prompt: payload.prompt,
              aiResponse: rev.resultContent ? JSON.stringify(rev.resultContent) : null,
              timestamp: rev.createdAt,
              status: rev.status,
            },
          ])
          if (rev.resultContent && typeof rev.resultContent === 'object') {
            await loadStudy()
          }
          toast.success('Revision submitted')
        } else {
          await handleSubmitRevision(
            payload.blockIds[0] ?? currentSection?.id ?? '',
            payload.prompt,
            payload.notes
          )
        }
      } catch {
        toast.error('Revision failed')
      } finally {
        setIsSubmittingRevision(false)
      }
    },
    [studyId, useSupabase, currentSection?.id, handleSubmitRevision]
  )

  const handleConflictResolve = useCallback(
    async (strategy: 'keep_local' | 'keep_server' | 'merge') => {
      if (!studyId) return
      await resolveConflict(studyId, '', strategy)
      setHasConflict(false)
      if (strategy === 'keep_server') {
        await loadStudy()
      }
    },
    [studyId, loadStudy]
  )

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
          <Button variant="outline" size="sm" asChild>
            <Link to={`/dashboard/studies/${studyId}`}>View Study</Link>
          </Button>
          {useSupabase && (
            <AutosaveIndicator status={autosaveStatus} className="shrink-0" />
          )}
          <PermissionsBadge role={userRole} className="hidden sm:inline-flex" />
          <div className="hidden w-48 sm:block">
            <p className="text-xs font-medium text-muted-foreground">Progress</p>
            <Progress value={completionPercent} className="h-2" />
          </div>
        </div>
      </header>

      {hasConflict && (
        <div className="shrink-0 px-6 py-3">
          <ConflictIndicator
            hasConflict={hasConflict}
            conflictId=""
            studyId={studyId}
            onResolve={handleConflictResolve}
          />
        </div>
      )}

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
                  onBlur={useSupabase ? handleBlockBlur : undefined}
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

          <aside className="hidden w-80 shrink-0 flex-col overflow-auto border-l border-border bg-background lg:flex">
            <Tabs defaultValue="revision" className="flex h-full flex-col">
              <TabsList className="mx-4 mt-4 grid w-[calc(100%-2rem)] grid-cols-3 rounded-xl">
                <TabsTrigger value="revision" className="rounded-lg">
                  Revise
                </TabsTrigger>
                <TabsTrigger value="versions" className="rounded-lg">
                  History
                </TabsTrigger>
                <TabsTrigger value="preview" className="rounded-lg">
                  Preview
                </TabsTrigger>
              </TabsList>
              <TabsContent value="revision" className="mt-4 flex-1 overflow-auto px-4 pb-4">
                <div className="space-y-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full rounded-full"
                    onClick={() => setRevisionModalOpen(true)}
                    aria-label="Open revision request modal"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Request AI Revision
                  </Button>
                  <RevisionPanel
                    selectedBlock={currentSection}
                    draftText={draftTextPreview}
                    onSubmitRevision={handleSubmitRevision}
                    revisionsHistory={aiInteractionHistory}
                    isSubmitting={isSubmittingRevision}
                  />
                  <SourceReferencesPanel references={sourceReferences} />
                  <ExportSharePanel
                    studyData={studyData}
                    onExport={handleExport}
                    onShare={handleShare}
                    isExporting={isExporting}
                    isSharing={isSharing}
                  />
                </div>
              </TabsContent>
              <TabsContent value="versions" className="mt-4 flex-1 overflow-auto px-4 pb-4">
                <VersionHistoryPanel
                  versions={versionHistory}
                  onRestoreVersion={handleRestoreVersion}
                  isRestoring={isRestoring}
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-4 flex-1 overflow-auto px-4 pb-4">
                <PreviewPane sections={studyData} />
              </TabsContent>
            </Tabs>
          </aside>
          <RevisionRequestModal
            open={revisionModalOpen}
            onOpenChange={setRevisionModalOpen}
            blocks={studyData}
            selectedBlockIds={selectedRevisionBlockIds}
            onSelectedBlockIdsChange={setSelectedRevisionBlockIds}
            onSubmit={(p) => { void handleSubmitRevisionWithContext({ blockIds: p.blockIds, prompt: p.prompt, intent: p.intent, notes: p.notes }) }}
            isSubmitting={isSubmittingRevision}
          />
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
