import { useReducer, useCallback, useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Upload,
  User,
  Settings,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  StepperNav,
  TopicContextForm,
  MaterialsUploader,
  ChildStyleSelector,
  GenerationOptionsForm,
  AIProgressPanel,
  ReviewEditPanel,
  SidebarPanel,
  PreviewCard,
  WizardOverview,
  StatusBadge,
  VersioningPanel,
  LayoutPreview,
  SettingsDrawer,
} from '@/components/study-wizard'
import { fetchChildProfiles } from '@/api/profile'
import {
  prepareStudy,
  streamStudyGeneration,
  reviseStudy,
  createVersion,
  approveStudy,
  exportStudy,
  fetchStudyVersions,
} from '@/api/studies'
import { GRADE_LEVELS } from '@/types/profile'
import type { VersionMetadata } from '@/types/study-builder'
import type {
  TopicContext,
  Material,
  ChildProfile,
  LearningStyle,
  GenerationOptions,
  AIOutputBlock,
  Version,
} from '@/types/study-wizard'

const STEPS = [
  { id: 1, title: 'Topic & Context', icon: FileText,  emoji: '✏️' },
  { id: 2, title: 'Upload Materials', icon: Upload,   emoji: '📎' },
  { id: 3, title: 'Child & Style',   icon: User,     emoji: '🧒' },
  { id: 4, title: 'Gen Options',     icon: Settings,  emoji: '⚙️' },
  { id: 5, title: 'AI Generation',   icon: Sparkles,  emoji: '✨' },
  { id: 6, title: 'Review & Save',   icon: Check,    emoji: '🎉' },
]

const STEP_COLORS = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-pink-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-orange-500',
]

const MOCK_CHILDREN: ChildProfile[] = [
  { id: '1', name: 'Emma', age: 8, grade: '3rd Grade' },
  { id: '2', name: 'Liam', age: 11, grade: '6th Grade' },
]

const MOCK_OUTPUT_BLOCKS: AIOutputBlock[] = [
  { type: 'text', content: '## Overview\n\nThis study set covers the key concepts.', order: 0 },
  { type: 'list', content: '- Key point 1\n- Key point 2\n- Key point 3', order: 1 },
  { type: 'text', content: '## Key Concepts\n\nReview these before practice.', order: 2 },
]

function mapProfileChildToWizardChild(c: { id: string; name: string; age: number; grade: string }): ChildProfile {
  const label = GRADE_LEVELS.find((g) => g.value === c.grade)?.label ?? c.grade
  return { id: c.id, name: c.name, age: c.age, grade: label }
}

interface WizardState {
  step: number
  topicContext: TopicContext
  materials: Material[]
  selectedChildId: string | null
  learningStyle: LearningStyle | null
  generationOptions: GenerationOptions
  aiBlocks: AIOutputBlock[]
  versions: Version[]
  versionsMetadata: VersionMetadata[]
  studyId: string | null
  isGenerating: boolean
  generationProgress: number
  generationError: string | null
  isApproving: boolean
  isDuplicating: boolean
  isExporting: boolean
}

const INITIAL_STATE: WizardState = {
  step: 0,
  topicContext: { topic: '', subject: '' },
  materials: [],
  selectedChildId: null,
  learningStyle: null,
  generationOptions: {
    depth: 'medium',
    outputs: ['flashcards', 'quizzes'],
    curriculumAligned: false,
  },
  aiBlocks: [],
  versions: [],
  versionsMetadata: [],
  studyId: null,
  isGenerating: false,
  generationProgress: 0,
  generationError: null,
  isApproving: false,
  isDuplicating: false,
  isExporting: false,
}

type WizardAction =
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_TOPIC'; value: TopicContext }
  | { type: 'SET_MATERIALS'; value: Material[] }
  | { type: 'SET_CHILD'; id: string | null }
  | { type: 'SET_LEARNING_STYLE'; value: LearningStyle | null }
  | { type: 'SET_OPTIONS'; value: GenerationOptions }
  | { type: 'SET_BLOCKS'; value: AIOutputBlock[] }
  | { type: 'ADD_BLOCK'; block: AIOutputBlock }
  | { type: 'SET_STUDY_ID'; studyId: string | null }
  | { type: 'SET_GENERATING'; value: boolean }
  | { type: 'SET_PROGRESS'; value: number }
  | { type: 'SET_ERROR'; value: string | null }
  | { type: 'SET_APPROVING'; value: boolean }
  | { type: 'SET_DUPLICATING'; value: boolean }
  | { type: 'SET_EXPORTING'; value: boolean }
  | { type: 'ADD_VERSION'; version: Version }
  | { type: 'SET_OCR_STATUS'; materialId: string; status: import('@/types/study-wizard').OCRStatus }
  | { type: 'SET_VERSIONS'; versions: Version[] }
  | { type: 'SET_VERSIONS_METADATA'; versions: VersionMetadata[] }

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step }
    case 'SET_TOPIC':
      return { ...state, topicContext: action.value }
    case 'SET_MATERIALS':
      return { ...state, materials: action.value }
    case 'SET_CHILD':
      return { ...state, selectedChildId: action.id }
    case 'SET_LEARNING_STYLE':
      return { ...state, learningStyle: action.value }
    case 'SET_OPTIONS':
      return { ...state, generationOptions: action.value }
    case 'SET_BLOCKS':
      return { ...state, aiBlocks: action.value }
    case 'ADD_BLOCK':
      return { ...state, aiBlocks: [...(state.aiBlocks ?? []), action.block] }
    case 'SET_STUDY_ID':
      return { ...state, studyId: action.studyId }
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.value }
    case 'SET_PROGRESS':
      return { ...state, generationProgress: action.value }
    case 'SET_ERROR':
      return { ...state, generationError: action.value }
    case 'SET_APPROVING':
      return { ...state, isApproving: action.value }
    case 'SET_DUPLICATING':
      return { ...state, isDuplicating: action.value }
    case 'SET_EXPORTING':
      return { ...state, isExporting: action.value }
    case 'ADD_VERSION':
      return { ...state, versions: [...(state.versions ?? []), action.version] }
    case 'SET_OCR_STATUS':
      return {
        ...state,
        materials: (state.materials ?? []).map((m) =>
          m.id === action.materialId ? { ...m, ocrStatus: action.status } : m
        ),
      }
    case 'SET_VERSIONS':
      return { ...state, versions: action.versions }
    case 'SET_VERSIONS_METADATA':
      return {
        ...state,
        versionsMetadata: action.versions,
        versions: action.versions.map((v) => ({
          id: v.id,
          studyId: v.studyId,
          snapshot: {},
          createdAt: v.createdAt,
        })),
      }
    default:
      return state
  }
}

function validateStep(
  step: number,
  state: WizardState
): Record<string, string> {
  const errors: Record<string, string> = {}
  if (step === 1) {
    if (!state.topicContext?.topic?.trim()) errors.topic = 'Topic is required'
  }
  if (step === 2) {
    const hasMaterials = (state.materials ?? []).length > 0
    const hasNotes = !!state.topicContext?.contextNotes?.trim()
    if (!hasMaterials && !hasNotes) {
      errors.materials = 'Add at least one material or add notes in the topic step'
    }
  }
  if (step === 3) {
    if (!state.selectedChildId) errors.childProfileId = 'Select a child'
    if (!state.learningStyle) errors.learningStyle = 'Select a learning style'
  }
  if (step === 4) {
    const outputs = state.generationOptions?.outputs ?? []
    if (outputs.length === 0) errors.outputs = 'Select at least one output type'
  }
  return errors
}

export function StudyWizardContainer() {
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(wizardReducer, INITIAL_STATE)
  const [children, setChildren] = useState<ChildProfile[]>([])
  const abortRef = useRef(false)

  useEffect(() => {
    fetchChildProfiles()
      .then((list) => {
        const mapped = (list ?? []).map(mapProfileChildToWizardChild)
        setChildren(mapped.length > 0 ? mapped : MOCK_CHILDREN)
      })
      .catch(() => setChildren(MOCK_CHILDREN))
  }, [])

  useEffect(() => {
    if (state.studyId) {
      fetchStudyVersions(state.studyId)
        .then((list) => {
          dispatch({ type: 'SET_VERSIONS_METADATA', versions: list ?? [] })
        })
        .catch(() => {})
    }
  }, [state.studyId])

  const displayChildren = (children ?? []).length > 0 ? children : MOCK_CHILDREN
  const selectedChild = (displayChildren ?? []).find((c) => c.id === state.selectedChildId) ?? null

  const progress = state.step === 0 ? 0 : (state.step / (STEPS?.length ?? 6)) * 100

  const handleStepClick = useCallback((stepId: number) => {
    if (!state.isGenerating && stepId < state.step) {
      dispatch({ type: 'SET_STEP', step: stepId })
    }
  }, [state.isGenerating, state.step])

  const handleNext = useCallback(() => {
    const errors = validateStep(state.step, state)
    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach((msg) => toast.error(msg))
      return
    }
    if (state.step < (STEPS?.length ?? 6)) {
      dispatch({ type: 'SET_STEP', step: state.step + 1 })
    }
  }, [state])

  const handleBack = useCallback(() => {
    if (state.step > 1) {
      dispatch({ type: 'SET_STEP', step: state.step - 1 })
    }
  }, [state.step])

  const simulateStreaming = useCallback(async () => {
    abortRef.current = false
    const blocks = MOCK_OUTPUT_BLOCKS ?? []
    const interval = 800
    for (let i = 0; i < blocks.length; i++) {
      if (abortRef.current) break
      await new Promise((r) => setTimeout(r, interval))
      dispatch({ type: 'ADD_BLOCK', block: blocks[i] })
      dispatch({ type: 'SET_PROGRESS', value: ((i + 1) / (blocks.length + 1)) * 100 })
    }
    if (!abortRef.current) {
      dispatch({ type: 'SET_PROGRESS', value: 100 })
      dispatch({ type: 'SET_STEP', step: 6 })
    }
  }, [])

  const handleStartGeneration = useCallback(async () => {
    abortRef.current = false
    dispatch({ type: 'SET_GENERATING', value: true })
    dispatch({ type: 'SET_PROGRESS', value: 0 })
    dispatch({ type: 'SET_BLOCKS', value: [] })
    dispatch({ type: 'SET_ERROR', value: null })

    const hasSupabase = Boolean(
      import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    )

    if (!hasSupabase) {
      simulateStreaming().finally(() => dispatch({ type: 'SET_GENERATING', value: false }))
      return
    }

    try {
      const payload = {
        topic: state.topicContext?.topic ?? '',
        subject: state.topicContext?.subject,
        contextNotes: state.topicContext?.contextNotes,
        examDate: state.topicContext?.examDate,
        generationOptions: {
          depth: state.generationOptions?.depth ?? 'medium',
          outputs: state.generationOptions?.outputs ?? ['flashcards', 'quizzes'],
          curriculumAligned: state.generationOptions?.curriculumAligned ?? false,
        },
        // Include full OCR/transcription text so the AI Edge Function can use documents as context
        uploadedMaterials: (state.materials ?? []).map((m) => ({
          id: m.id,
          type: m.type,
          sourceUrl: m.url,
          ocrText: m.ocrText ?? m.transcription ?? null,
          snippets: (m.ocrSnippets ?? []).filter((s) => s.important).map((s) => s.text),
          metadata: { name: m.name, size: m.size ?? null },
        })),
        childProfile: selectedChild
          ? { id: selectedChild.id, age: selectedChild.age, grade: selectedChild.grade, learningPreferences: [] }
          : { id: '', age: 8, grade: '3', learningPreferences: [] },
        learningStyle: state.learningStyle ?? 'playful',
      }

      const prepared = await prepareStudy(payload)
      const sid = (prepared as { studyId?: string })?.studyId
      if (!sid) {
        toast.error('Failed to prepare study')
        simulateStreaming().finally(() => dispatch({ type: 'SET_GENERATING', value: false }))
        return
      }

      dispatch({ type: 'SET_STUDY_ID', studyId: sid })

      await streamStudyGeneration(
        sid,
        {
          onBlock: (block) => dispatch({ type: 'ADD_BLOCK', block }),
          onProgress: (pct) => dispatch({ type: 'SET_PROGRESS', value: pct }),
          onComplete: () => {
            dispatch({ type: 'SET_PROGRESS', value: 100 })
            dispatch({ type: 'SET_STEP', step: 6 })
          },
          onError: (err) => {
            dispatch({ type: 'SET_ERROR', value: err.message })
            toast.error(err.message)
          },
        }
      )
    } catch (err) {
      toast.info('Using offline preview')
      simulateStreaming()
    } finally {
      dispatch({ type: 'SET_GENERATING', value: false })
    }
  }, [state.topicContext, state.materials, state.learningStyle, state.generationOptions, selectedChild, simulateStreaming])

  const handleCancelGeneration = useCallback(() => {
    abortRef.current = true
  }, [])

  const handleApprove = useCallback(async () => {
    const studyId = state.studyId
    if (!studyId) {
      toast.error('No study to approve')
      return
    }
    dispatch({ type: 'SET_APPROVING', value: true })
    try {
      await createVersion(studyId)
      await approveStudy(studyId)
      toast.success('Study approved!')
      navigate('/dashboard/studies')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      dispatch({ type: 'SET_APPROVING', value: false })
    }
  }, [state.studyId, navigate])

  const handleDuplicate = useCallback(() => {
    dispatch({ type: 'SET_DUPLICATING', value: true })
    toast.success('Study duplicated!')
    dispatch({ type: 'SET_DUPLICATING', value: false })
  }, [])

  const handleExport = useCallback(async (format: 'pdf' | 'json') => {
    const studyId = state.studyId
    if (!studyId) {
      if (format === 'json') {
        const blob = new Blob(
          [JSON.stringify({ blocks: state.aiBlocks, topicContext: state.topicContext }, null, 2)],
          { type: 'application/json' }
        )
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'study-export.json'
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Exported as JSON')
      } else {
        toast.error('No study to export')
      }
      return
    }
    dispatch({ type: 'SET_EXPORTING', value: true })
    try {
      const fmt = format === 'pdf' ? 'pdf' : 'html'
      const result = await exportStudy(studyId, fmt)
      const exportUrl = result && typeof result === 'object' && 'url' in result && typeof (result as { url: string }).url === 'string'
        ? (result as { url: string }).url
        : undefined
      if (exportUrl) {
        window.open(exportUrl, '_blank')
        toast.success(`Exported as ${format.toUpperCase()}`)
      } else if (format === 'json') {
        const blob = new Blob(
          [JSON.stringify({ blocks: state.aiBlocks, topicContext: state.topicContext }, null, 2)],
          { type: 'application/json' }
        )
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `study-${studyId}.json`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Exported as JSON')
      } else {
        toast.info('Export prepared')
      }
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      dispatch({ type: 'SET_EXPORTING', value: false })
    }
  }, [state.studyId, state.aiBlocks, state.topicContext])

  const handleRequestRevision = useCallback(async (comments: string) => {
    const studyId = state.studyId
    if (!studyId) {
      toast.error('No study to revise')
      return
    }
    try {
      const result = await reviseStudy(studyId, comments)
      if (result?.blocks) {
        dispatch({ type: 'SET_BLOCKS', value: result.blocks })
        toast.success('Revision applied')
      } else {
        toast.info('Revision requested. Regenerating...')
        handleStartGeneration()
      }
    } catch (err) {
      toast.error((err as Error).message)
    }
  }, [state.studyId, handleStartGeneration])

  const handleOcrStatusChange = useCallback(
    (materialId: string, status: import('@/types/study-wizard').OCRStatus) => {
      dispatch({ type: 'SET_OCR_STATUS', materialId, status })
    },
    []
  )

  const stepErrors = validateStep(state.step, state)
  const canProceed = Object.keys(stepErrors).length === 0
  const isStep5 = state.step === 5
  const isStep6 = state.step === 6
  const showGenerateButton = isStep5 && !state.isGenerating && state.aiBlocks.length === 0 && canProceed

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {state.step > 0 && (
        <div className="border-b border-border bg-gradient-to-r from-card via-card to-primary/5 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Emoji step indicators */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {(STEPS ?? []).map((step) => {
                const isCurrent = state.step === step.id
                const isDone = state.step > step.id
                const color = STEP_COLORS[(step.id - 1) % STEP_COLORS.length]
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => handleStepClick(step.id)}
                    disabled={state.isGenerating || step.id > state.step}
                    className={cn(
                      'flex shrink-0 items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-bold transition-all duration-200',
                      isCurrent
                        ? `${color} text-white shadow-sm scale-105`
                        : isDone
                        ? 'bg-green-500 text-white opacity-80 hover:opacity-100'
                        : 'bg-muted text-muted-foreground opacity-50',
                    )}
                    aria-label={`Step ${step.id}: ${step.title}`}
                  >
                    <span className="text-sm leading-none">
                      {isDone ? '✓' : step.emoji}
                    </span>
                    <span className="hidden sm:inline">{step.title}</span>
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {(isStep5 || isStep6) && (
                <StatusBadge
                  variant={
                    state.isGenerating ? 'streaming' : state.generationError ? 'error' : (state.aiBlocks?.length ?? 0) > 0 ? 'complete' : 'idle'
                  }
                  progressPct={state.generationProgress}
                  stage={state.isGenerating ? 'Generating...' : undefined}
                />
              )}
              <SettingsDrawer quota={{ usedCount: 0, limit: 10, windowEnd: new Date().toISOString() }} />
            </div>
          </div>
          {/* Thin progress bar */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="container max-w-2xl py-8">
            {state.step === 0 && (
              <WizardOverview onStart={() => dispatch({ type: 'SET_STEP', step: 1 })} />
            )}

            {state.step === 1 && (
              <TopicContextForm
                value={state.topicContext}
                onChange={(v) => dispatch({ type: 'SET_TOPIC', value: v })}
                errors={stepErrors}
              />
            )}

            {state.step === 2 && (
              <MaterialsUploader
                materials={state.materials}
                onChange={(v) => dispatch({ type: 'SET_MATERIALS', value: v })}
                onOcrStatusChange={handleOcrStatusChange}
                errors={stepErrors}
              />
            )}

            {state.step === 3 && (
              <ChildStyleSelector
                children={displayChildren}
                selectedChildId={state.selectedChildId}
                learningStyle={state.learningStyle}
                onChildSelect={(id) => dispatch({ type: 'SET_CHILD', id })}
                onLearningStyleSelect={(s) => dispatch({ type: 'SET_LEARNING_STYLE', value: s })}
                errors={stepErrors}
              />
            )}

            {state.step === 4 && (
              <GenerationOptionsForm
                value={state.generationOptions}
                onChange={(v) => dispatch({ type: 'SET_OPTIONS', value: v })}
                errors={stepErrors}
              />
            )}

            {state.step === 5 && (
              <AIProgressPanel
                isGenerating={state.isGenerating}
                progress={state.generationProgress}
                blocks={state.aiBlocks}
                error={state.generationError}
                onCancel={handleCancelGeneration}
                onRetry={handleStartGeneration}
                onRegenerate={handleStartGeneration}
                onStartGeneration={showGenerateButton ? handleStartGeneration : undefined}
              />
            )}

            {state.step === 6 && (
              <div className="space-y-6">
                <PreviewCard
                  topicContext={state.topicContext}
                  childProfile={selectedChild}
                  learningStyle={state.learningStyle}
                  generationOptions={state.generationOptions}
                  blocks={state.aiBlocks}
                />
                <LayoutPreview
                  blocks={state.aiBlocks}
                  topic={state.topicContext?.topic}
                  onExport={(fmt) => {
                    if (fmt === 'pdf' || fmt === 'html') {
                      const studyId = state.studyId
                      if (studyId) {
                        dispatch({ type: 'SET_EXPORTING', value: true })
                        exportStudy(studyId, fmt)
                          .then((r) => {
                            const u = r && typeof r === 'object' && 'url' in r && typeof (r as { url: string }).url === 'string'
                              ? (r as { url: string }).url
                              : undefined
                            if (u) window.open(u, '_blank')
                            toast.success(`Exported as ${fmt.toUpperCase()}`)
                          })
                          .catch((e) => toast.error((e as Error).message))
                          .finally(() => dispatch({ type: 'SET_EXPORTING', value: false }))
                      } else {
                        toast.error('No study to export')
                      }
                    }
                  }}
                  isExporting={state.isExporting}
                />
                <ReviewEditPanel
                  blocks={state.aiBlocks}
                  onBlocksChange={(v) => dispatch({ type: 'SET_BLOCKS', value: v })}
                  onApprove={handleApprove}
                  onDuplicate={handleDuplicate}
                  onExport={handleExport}
                  onRequestRevision={handleRequestRevision}
                  isApproving={state.isApproving}
                  isDuplicating={state.isDuplicating}
                  isExporting={state.isExporting}
                />
              </div>
            )}
          </div>
        </div>

        {state.step >= 1 && (
          <aside className="hidden w-full shrink-0 border-l border-border bg-card md:block lg:w-80">
            <div className="sticky top-0 max-h-[calc(100vh-4rem)] overflow-y-auto p-4 space-y-4">
              <SidebarPanel
                topicContext={state.topicContext}
                childProfile={selectedChild}
                learningStyle={state.learningStyle}
                generationOptions={state.generationOptions}
                materials={state.materials}
                versions={state.versions}
              />
              {state.studyId && (
                <VersioningPanel
                  versions={state.versionsMetadata ?? []}
                  onRestore={async (versionId) => {
                    const { fetchVersion } = await import('@/api/studies')
                    const detail = await fetchVersion(state.studyId!, versionId)
                    const blocks = detail?.contentSnapshot?.blocks
                    if (Array.isArray(blocks) && blocks.length > 0) {
                      dispatch({ type: 'SET_BLOCKS', value: blocks })
                      toast.success('Version restored')
                    } else {
                      toast.error('Could not restore version')
                    }
                  }}
                />
              )}
            </div>
          </aside>
        )}
      </div>

      {state.step > 0 && state.step < 6 && !isStep5 && (
        <div className="border-t border-border bg-gradient-to-r from-card via-card to-primary/5 px-6 py-4">
          <div className="container flex max-w-2xl items-center justify-between gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleBack}
              disabled={state.step === 1 || state.isGenerating}
              className="gap-2 rounded-2xl"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <span className="text-xs font-bold text-muted-foreground hidden sm:block">
              Step {state.step} of {STEPS.length}
            </span>
            <Button
              size="lg"
              onClick={handleNext}
              disabled={!canProceed || state.isGenerating}
              className="gap-2 rounded-2xl font-black bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {isStep5 && !state.isGenerating && state.aiBlocks.length === 0 && (
        <div className="border-t border-border bg-gradient-to-r from-card via-card to-emerald-500/5 px-6 py-4">
          <div className="container flex max-w-2xl items-center justify-between gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleBack}
              disabled={state.isGenerating}
              className="gap-2 rounded-2xl"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              size="lg"
              onClick={handleStartGeneration}
              disabled={!canProceed}
              className="gap-2 rounded-2xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90 shadow-lg"
            >
              <Sparkles className="h-5 w-5" />
              Generate Study ✨
            </Button>
          </div>
        </div>
      )}

      {isStep6 && (
        <div className="border-t border-border bg-gradient-to-r from-card via-card to-orange-500/5 px-6 py-4">
          <div className="container flex max-w-2xl items-center justify-between gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => dispatch({ type: 'SET_STEP', step: 5 })}
              className="gap-2 rounded-2xl"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              size="lg"
              onClick={() => navigate('/dashboard/studies')}
              className="gap-2 rounded-2xl font-black bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
            >
              Done — View Studies 🎉
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
