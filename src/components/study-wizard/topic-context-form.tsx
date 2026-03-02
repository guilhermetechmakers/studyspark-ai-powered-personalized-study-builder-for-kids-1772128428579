import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SUBJECTS, type TopicContext } from '@/types/study-wizard'
import { cn } from '@/lib/utils'

const SUBJECT_META: Record<string, { emoji: string; color: string; border: string }> = {
  Math:      { emoji: '🔢', color: 'bg-blue-100 dark:bg-blue-900/30',    border: 'border-blue-400' },
  Science:   { emoji: '🔬', color: 'bg-green-100 dark:bg-green-900/30',  border: 'border-green-400' },
  History:   { emoji: '🏛️', color: 'bg-amber-100 dark:bg-amber-900/30',  border: 'border-amber-400' },
  English:   { emoji: '📖', color: 'bg-violet-100 dark:bg-violet-900/30', border: 'border-violet-400' },
  Geography: { emoji: '🌍', color: 'bg-teal-100 dark:bg-teal-900/30',    border: 'border-teal-400' },
  Art:       { emoji: '🎨', color: 'bg-pink-100 dark:bg-pink-900/30',     border: 'border-pink-400' },
  Music:     { emoji: '🎵', color: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-400' },
  Other:     { emoji: '📚', color: 'bg-muted',                            border: 'border-border' },
}

export interface TopicContextFormProps {
  value: TopicContext
  onChange: (value: TopicContext) => void
  errors?: Record<string, string>
  className?: string
}

export function TopicContextForm({
  value,
  onChange,
  errors = {},
  className,
}: TopicContextFormProps) {
  const { topic = '', subject = '', contextNotes = '', examDate = '' } = value ?? {}

  const update = useCallback(
    (updates: Partial<TopicContext>) => {
      onChange({ ...value, ...updates })
    },
    [value, onChange],
  )

  const selectedMeta = subject ? SUBJECT_META[subject] : null

  return (
    <div className={cn('space-y-6', className)}>
      {/* Step header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500 text-white font-black text-lg shadow-sm">
          1
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground">Topic & Context</h2>
          <p className="text-sm text-muted-foreground">What is the exam or topic? Add any notes from the teacher.</p>
        </div>
      </div>

      {/* Main card */}
      <div className="overflow-hidden rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 dark:border-blue-800 dark:from-blue-900/20 dark:to-sky-900/10 p-6 space-y-5">
        {/* Topic input */}
        <div className="space-y-2">
          <Label htmlFor="topic" className="text-sm font-bold">
            Study topic / Exam name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="topic"
            placeholder="e.g. Fractions & Decimals, World War II, The Water Cycle…"
            value={topic}
            onChange={(e) => update({ topic: e.target.value })}
            aria-invalid={!!errors.topic}
            aria-describedby={errors.topic ? 'topic-error' : undefined}
            className={cn(
              'min-h-[48px] rounded-2xl text-base font-medium border-2',
              errors.topic ? 'border-destructive' : 'border-blue-200 focus:border-blue-400 dark:border-blue-700',
            )}
          />
          {errors.topic && (
            <p id="topic-error" className="text-sm text-destructive flex items-center gap-1">
              <span>⚠️</span> {errors.topic}
            </p>
          )}
        </div>

        {/* Subject emoji picker */}
        <div className="space-y-2">
          <Label className="text-sm font-bold">Subject / Category</Label>
          <div className="flex flex-wrap gap-2">
            {(SUBJECTS ?? []).map((s) => {
              const meta = SUBJECT_META[s] ?? SUBJECT_META.Other
              const isSelected = subject === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => update({ subject: isSelected ? '' : s })}
                  className={cn(
                    'flex items-center gap-1.5 rounded-2xl border-2 px-3 py-1.5 text-sm font-bold transition-all duration-200',
                    isSelected
                      ? `${meta.color} ${meta.border} scale-105 shadow-sm`
                      : 'border-border bg-card hover:border-primary/40 hover:scale-105',
                  )}
                  aria-pressed={isSelected}
                >
                  <span className="text-base">{meta.emoji}</span>
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        {/* Additional notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-bold">
            Teacher notes / Key concepts{' '}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="notes"
            placeholder="e.g. Focus on chapters 3–5, include diagram questions, teacher said fractions on the test…"
            value={contextNotes}
            onChange={(e) => update({ contextNotes: e.target.value })}
            rows={3}
            className="rounded-2xl border-2 border-blue-200 text-sm focus:border-blue-400 dark:border-blue-700"
          />
        </div>

        {/* Exam date */}
        <div className="space-y-2">
          <Label htmlFor="examDate" className="text-sm font-bold">
            Exam / Due date{' '}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="examDate"
            type="date"
            value={examDate}
            onChange={(e) => update({ examDate: e.target.value || undefined })}
            className="min-h-[44px] max-w-[220px] rounded-2xl border-2 border-blue-200 focus:border-blue-400 dark:border-blue-700"
          />
        </div>
      </div>

      {/* Live preview */}
      {(topic || subject || contextNotes || examDate) && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-800 dark:bg-amber-900/20">
          <span className="text-xl shrink-0 select-none">{selectedMeta?.emoji ?? '📋'}</span>
          <div className="min-w-0 text-sm">
            <p className="font-bold text-foreground mb-0.5">Summary preview</p>
            <p className="text-muted-foreground">
              {[
                topic && `"${topic}"`,
                subject && `• ${subject}`,
                examDate && `• Exam: ${new Date(examDate).toLocaleDateString()}`,
              ].filter(Boolean).join(' ')}
            </p>
            {contextNotes && (
              <p className="mt-1 text-muted-foreground">
                Notes: {contextNotes.length > 100 ? contextNotes.slice(0, 100) + '…' : contextNotes}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
