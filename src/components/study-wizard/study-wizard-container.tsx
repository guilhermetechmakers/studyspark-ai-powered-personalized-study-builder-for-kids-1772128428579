import { useReducer, useCallback, useRef } from 'react'
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
} from '@/components/study-wizard'
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
  { id: 1, title: 'Topic & Context', icon: FileText },
  { id: 2, title: 'Upload Materials', icon: Upload },
  { id: 3, title: 'Child & Style', icon: User },
  { id: 4, title: 'Generation Options', icon: Settings },
  { id: 5, title: 'AI Generation', icon: Sparkles },
  { id: 6, title: 'Review & Edit', icon: Check },
]

const MOCK_CHILDREN: ChildProfile[] = [
  { id: '1', name: 'Emma', age: 8, grade: '3rd Grade' },
  { id: '2', name: 'Liam', age: 11, grade: '6th Grade' },
]

const MOCK_OUTPUT_BLOCKS: AIOutputBlock[] = [
  {
    type: 'text',
    content:
      '## Fractions Overview\n\nFractions represent parts of a whole. The top number (numerator) shows how many parts we have. The bottom number (denominator) shows how many equal parts the whole is divided into.',
    order: 0,
  },
  {
    type: 'list',
    content:
      '- 1/2 means one half\n- 1/4 means one quarter\n- 3/4 means three quarters',
    order: 1,
  },
  {
    type: 'text',
    content:
      '## Key Concepts\n\nWhen adding fractions with the same denominator, add the numerators and keep the denominator the same.',
    order: 2,
  },
]

interface WizardState {
  step: number
  topicContext: TopicContext
  materials: Material[]
  selectedChildId: string | null
  learningStyle: LearningStyle | null
  generationOptions: GenerationOptions
  aiBlocks: AIOutputBlock[]
  versions: Version[]
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
  | { type: 'SET_GENERATING'; value: boolean }
  | { type: 'SET_PROGRESS'; value: number }
  | { type: 'SET_ERROR'; value: string | null }
  | { type: 'SET_APPROVING'; value: boolean }
  | { type: 'SET_DUPLICATING'; value: boolean }
  | { type: 'SET_EXPORTING'; value: boolean }
  | { type: 'ADD_VERSION'; version: Version }
  | { type: 'SET_OCR_STATUS'; materialId: string; status: import('@/types/study-wizard').OCRStatus }

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
  const abortRef = useRef(false)

  const children = MOCK_CHILDREN
  const selectedChild = (children ?? []).find((c) => c.id === state.selectedChildId) ?? null

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
    dispatch({ type: 'SET_GENERATING', value: true })
    dispatch({ type: 'SET_PROGRESS', value: 0 })
    dispatch({ type: 'SET_BLOCKS', value: [] })
    dispatch({ type: 'SET_ERROR', value: null })

    const blocks = MOCK_OUTPUT_BLOCKS ?? []
    const interval = 1000 / (blocks.length + 1)
    let p = 0

    for (let i = 0; i < blocks.length; i++) {
      if (abortRef.current) break
      await new Promise((r) => setTimeout(r, interval))
      dispatch({ type: 'ADD_BLOCK', block: blocks[i] })
      p = ((i + 1) / (blocks.length + 1)) * 100
      dispatch({ type: 'SET_PROGRESS', value: p })
    }

    if (!abortRef.current) {
      dispatch({ type: 'SET_PROGRESS', value: 100 })
      dispatch({ type: 'SET_STEP', step: 6 })
    }
    dispatch({ type: 'SET_GENERATING', value: false })
  }, [])

  const handleStartGeneration = useCallback(() => {
    simulateStreaming()
  }, [simulateStreaming])

  const handleCancelGeneration = useCallback(() => {
    abortRef.current = true
  }, [])

  const handleApprove = useCallback(() => {
    dispatch({ type: 'SET_APPROVING', value: true })
    dispatch({
      type: 'ADD_VERSION',
      version: {
        id: `v-${Date.now()}`,
        studyId: 'mock',
        snapshot: { ...state },
        createdAt: new Date().toISOString(),
      },
    })
    toast.success('Study approved!')
    dispatch({ type: 'SET_APPROVING', value: false })
    navigate('/dashboard/studies')
  }, [state, navigate])

  const handleDuplicate = useCallback(() => {
    dispatch({ type: 'SET_DUPLICATING', value: true })
    toast.success('Study duplicated!')
    dispatch({ type: 'SET_DUPLICATING', value: false })
  }, [])

  const handleExport = useCallback((format: 'pdf' | 'json') => {
    dispatch({ type: 'SET_EXPORTING', value: true })
    toast.success(`Exporting as ${format.toUpperCase()}...`)
    dispatch({ type: 'SET_EXPORTING', value: false })
  }, [])

  const handleRequestRevision = useCallback((_comments: string) => {
    toast.info('Revision requested. Regenerating...')
    simulateStreaming()
  }, [simulateStreaming])

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
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <StepperNav
              steps={STEPS ?? []}
              currentStep={state.step}
              onStepClick={handleStepClick}
              disabled={state.isGenerating}
            />
            <Progress value={progress} className="hidden w-24 md:block" aria-label="Progress" />
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
                children={children}
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
          <SidebarPanel
            topicContext={state.topicContext}
            childProfile={selectedChild}
            learningStyle={state.learningStyle}
            generationOptions={state.generationOptions}
            materials={state.materials}
            versions={state.versions}
          />
        )}
      </div>

      {state.step > 0 && state.step < 6 && !isStep5 && (
        <div className="border-t border-border bg-card px-6 py-4">
          <div className="container flex max-w-2xl justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={state.step === 1 || state.isGenerating}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed || state.isGenerating}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {isStep5 && !state.isGenerating && state.aiBlocks.length === 0 && (
        <div className="border-t border-border bg-card px-6 py-4">
          <div className="container flex max-w-2xl justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={state.isGenerating}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleStartGeneration}
              disabled={!canProceed}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Study
            </Button>
          </div>
        </div>
      )}

      {isStep6 && (
        <div className="border-t border-border bg-card px-6 py-4">
          <div className="container flex max-w-2xl justify-between">
            <Button
              variant="outline"
              onClick={() => dispatch({ type: 'SET_STEP', step: 5 })}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Generation
            </Button>
            <Button onClick={() => navigate('/dashboard/studies')}>
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
