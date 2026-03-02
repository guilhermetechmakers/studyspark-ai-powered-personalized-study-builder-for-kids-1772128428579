import { Layers, HelpCircle, BookOpen, FileText, Globe } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  DEPTH_LEVELS,
  OUTPUT_TYPES,
  type GenerationOptions,
} from '@/types/study-wizard'
import { cn } from '@/lib/utils'

type OutputType = 'flashcards' | 'quizzes' | 'lessonPlan' | 'printablePDF'

const DEPTH_META: Record<string, { emoji: string; color: string; border: string; bg: string; desc2: string }> = {
  short:  { emoji: '⚡', color: 'text-amber-600',  border: 'border-amber-400',  bg: 'bg-amber-50 dark:bg-amber-900/20',   desc2: 'Perfect for quick revision' },
  medium: { emoji: '📖', color: 'text-blue-600',   border: 'border-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20',     desc2: 'Great balance of depth' },
  deep:   { emoji: '🔬', color: 'text-violet-600', border: 'border-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20', desc2: 'Full coverage, more content' },
}

const OUTPUT_META: Record<string, { emoji: string; icon: React.ElementType; color: string; border: string; bg: string }> = {
  flashcards:   { emoji: '🃏', icon: Layers,    color: 'text-blue-600',   border: 'border-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
  quizzes:      { emoji: '❓', icon: HelpCircle, color: 'text-pink-600',   border: 'border-pink-400',   bg: 'bg-pink-50 dark:bg-pink-900/20' },
  lessonPlan:   { emoji: '📚', icon: BookOpen,   color: 'text-emerald-600', border: 'border-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  printablePDF: { emoji: '🖨️', icon: FileText,   color: 'text-amber-600',  border: 'border-amber-400',  bg: 'bg-amber-50 dark:bg-amber-900/20' },
}

export interface GenerationOptionsProps {
  value: GenerationOptions
  onChange: (value: GenerationOptions) => void
  errors?: Record<string, string>
  className?: string
}

export function GenerationOptionsForm({
  value,
  onChange,
  errors = {},
  className,
}: GenerationOptionsProps) {
  const { depth = 'medium', outputs = [], curriculumAligned = false } = value ?? {}

  const toggleOutput = (id: OutputType) => {
    const current = outputs ?? []
    const next = current.includes(id)
      ? current.filter((o) => o !== id)
      : [...current, id]
    onChange({ ...value, outputs: next })
  }

  const selectedDepthMeta = DEPTH_META[depth] ?? DEPTH_META.medium

  return (
    <div className={cn('space-y-6', className)}>
      {/* Step header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white font-black text-lg shadow-sm">
          4
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground">Generation Options</h2>
          <p className="text-sm text-muted-foreground">Choose content depth and what to generate.</p>
        </div>
      </div>

      {/* Depth selector */}
      <div className="overflow-hidden rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 dark:border-amber-800 dark:from-amber-900/20 dark:to-yellow-900/10 p-6 space-y-4">
        <p className="text-sm font-bold text-foreground">📊 Content depth</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {(DEPTH_LEVELS ?? []).map((d) => {
            const meta = DEPTH_META[d.id] ?? DEPTH_META.medium
            const isSelected = depth === d.id
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onChange({ ...value, depth: d.id })}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all duration-200',
                  isSelected
                    ? `${meta.border} ${meta.bg} scale-[1.03] shadow-md`
                    : 'border-border bg-white/60 hover:border-amber-300 hover:scale-[1.01] dark:bg-black/10',
                )}
                aria-pressed={isSelected}
              >
                <span className="text-3xl select-none">{meta.emoji}</span>
                <div>
                  <p className={cn('font-black text-sm', isSelected ? meta.color : 'text-foreground')}>{d.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{meta.desc2}</p>
                </div>
                {isSelected && (
                  <div className={cn('rounded-full px-2 py-0.5 text-xs font-bold text-white', meta.border.replace('border-', 'bg-'))}>
                    Selected ✓
                  </div>
                )}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {selectedDepthMeta.emoji} <strong>{depth}</strong>: {(DEPTH_LEVELS ?? []).find((d) => d.id === depth)?.desc ?? ''}
        </p>
      </div>

      {/* Output types */}
      <div className="overflow-hidden rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 dark:border-violet-800 dark:from-violet-900/20 dark:to-purple-900/10 p-6 space-y-4">
        <p className="text-sm font-bold text-foreground">
          🎯 What to generate <span className="text-destructive">*</span>
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(OUTPUT_TYPES ?? []).map((opt) => {
            const meta = OUTPUT_META[opt.id] ?? { emoji: '📋', icon: FileText, color: 'text-foreground', border: 'border-border', bg: 'bg-muted' }
            const isChecked = (outputs ?? []).includes(opt.id)
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleOutput(opt.id)}
                className={cn(
                  'flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200 w-full',
                  isChecked
                    ? `${meta.border} ${meta.bg} scale-[1.02] shadow-sm`
                    : 'border-border bg-white/60 hover:border-violet-300 hover:scale-[1.01] dark:bg-black/10',
                )}
                aria-pressed={isChecked}
                aria-label={`${isChecked ? 'Remove' : 'Add'} ${opt.label}`}
              >
                <span className="text-2xl select-none shrink-0">{meta.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className={cn('font-bold text-sm', isChecked ? meta.color : 'text-foreground')}>{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                </div>
                <div className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all',
                  isChecked ? `${meta.border} bg-current` : 'border-border bg-transparent',
                )}>
                  {isChecked && <span className="text-xs text-white font-bold">✓</span>}
                </div>
              </button>
            )
          })}
        </div>
        {errors.outputs && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <span>⚠️</span> {errors.outputs}
          </p>
        )}
      </div>

      {/* Curriculum aligned */}
      <div
        className={cn(
          'flex items-center justify-between rounded-2xl border-2 p-4 transition-all duration-200',
          curriculumAligned
            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
            : 'border-border bg-card',
        )}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl select-none shrink-0">🌍</span>
          <div>
            <Label htmlFor="curriculum" className="cursor-pointer font-bold text-sm">
              Curriculum aligned
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI will align content with standard curriculum when possible
            </p>
          </div>
        </div>
        <Checkbox
          id="curriculum"
          checked={curriculumAligned}
          onCheckedChange={(checked) =>
            onChange({ ...value, curriculumAligned: !!checked })
          }
          aria-label="Curriculum aligned"
          className="h-6 w-6 rounded-lg"
        />
      </div>
    </div>
  )
}
