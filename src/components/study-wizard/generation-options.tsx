import { HelpCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DEPTH_LEVELS,
  OUTPUT_TYPES,
  type GenerationOptions,
} from '@/types/study-wizard'
import { cn } from '@/lib/utils'

type OutputType = 'flashcards' | 'quizzes' | 'lessonPlan' | 'printablePDF'

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

  return (
    <TooltipProvider>
      <div className={cn('space-y-6', className)}>
        <Card className="overflow-hidden border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--peach-light))]/20 to-white">
          <CardHeader>
            <CardTitle>Generation Options</CardTitle>
            <CardDescription>
              Choose depth and output types. Each option affects the AI output.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Content depth</h4>
              <div className="flex flex-wrap gap-2">
                {(DEPTH_LEVELS ?? []).map((d) => {
                  const isSelected = depth === d.id
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => onChange({ ...value, depth: d.id })}
                      className={cn(
                        'rounded-full px-4 py-2 text-sm font-medium transition-all',
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {d.label}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {(DEPTH_LEVELS ?? []).find((d) => d.id === depth)?.desc ?? ''}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">
                Output types <span className="text-destructive">*</span>
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {(OUTPUT_TYPES ?? []).map((opt) => {
                  const isChecked = (outputs ?? []).includes(opt.id)
                  return (
                    <div
                      key={opt.id}
                      className={cn(
                        'flex items-center justify-between rounded-xl border-2 p-4 transition-all',
                        isChecked ? 'border-primary bg-primary/5' : 'border-border'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={opt.id}
                          checked={isChecked}
                          onCheckedChange={() => toggleOutput(opt.id)}
                          aria-label={`Include ${opt.label}`}
                        />
                        <div>
                          <Label
                            htmlFor={opt.id}
                            className="cursor-pointer font-medium"
                          >
                            {opt.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {opt.desc}
                          </p>
                        </div>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground"
                            aria-label={`Help for ${opt.label}`}
                          >
                            <HelpCircle className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-[200px] text-xs">
                            {opt.id === 'flashcards' &&
                              'Key terms with definitions for quick review.'}
                            {opt.id === 'quizzes' &&
                              'Multiple choice and short answer questions.'}
                            {opt.id === 'lessonPlan' &&
                              'Structured sequence with objectives and activities.'}
                            {opt.id === 'printablePDF' &&
                              'Formatted study guide for printing.'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )
                })}
              </div>
              {errors.outputs && (
                <p className="text-sm text-destructive">{errors.outputs}</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <Label htmlFor="curriculum" className="font-medium">
                  Curriculum aligned
                </Label>
                <p className="text-xs text-muted-foreground">
                  Align content with standard curriculum when possible
                </p>
              </div>
              <Checkbox
                id="curriculum"
                checked={curriculumAligned}
                onCheckedChange={(checked) =>
                  onChange({ ...value, curriculumAligned: !!checked })
                }
                aria-label="Curriculum aligned"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
