/**
 * ChildProfileForm - Create/edit child profile with age 4-18, grade enum, learningPreferences array.
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  GRADE_OPTIONS,
  LEARNING_PREFERENCE_OPTIONS,
  type ChildProfile,
  type ChildProfileInput,
} from '@/types/profile'
import { cn } from '@/lib/utils'

const childProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  age: z
    .number({ invalid_type_error: 'Age must be a number' })
    .min(4, 'Age must be 4–18')
    .max(18, 'Age must be 4–18'),
  grade: z.string().min(1, 'Grade is required'),
  learningPreferences: z
    .array(z.string())
    .min(1, 'Select at least one learning preference'),
})

export type ChildProfileFormValues = z.infer<typeof childProfileSchema>

export interface ChildProfileFormProps {
  defaultValues?: Partial<ChildProfile>
  onSubmit: (values: ChildProfileInput) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
  submitLabel?: string
}

const VALID_PREFS: readonly string[] = LEARNING_PREFERENCE_OPTIONS.map((o) => o.value)

const PREF_MAP: Record<string, string> = {
  playful: 'Playful',
  'exam-like': 'Exam-like',
  'research-based': 'Research-based',
  printable: 'Printable',
  interactive: 'Interactive',
}

function normalizePrefs(prefs: string[]): string[] {
  const validSet = new Set(VALID_PREFS as readonly string[])
  return (prefs ?? [])
    .map((p) => PREF_MAP[p] ?? (validSet.has(p) ? p : ''))
    .filter((s): s is string => Boolean(s))
}

export function ChildProfileForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save',
}: ChildProfileFormProps) {
  const prefs = defaultValues?.learningPreferences ?? []
  const validPrefs = normalizePrefs(Array.isArray(prefs) ? prefs : [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ChildProfileFormValues>({
    resolver: zodResolver(childProfileSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      age: defaultValues?.age ?? 8,
      grade: defaultValues?.grade ?? '3',
      learningPreferences: validPrefs.length > 0 ? validPrefs : ['Playful'],
    },
  })

  const grade = watch('grade')
  const learningPreferences = watch('learningPreferences')

  const togglePreference = (value: string) => {
    const current = learningPreferences ?? []
    const next = current.includes(value)
      ? current.filter((p) => p !== value)
      : [...current, value]
    setValue('learningPreferences', next, { shouldValidate: true })
  }

  return (
    <form
      onSubmit={handleSubmit((v) =>
        onSubmit({
          name: v.name,
          age: v.age,
          grade: v.grade,
          learningPreferences: v.learningPreferences,
        })
      )}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="child-name">Name</Label>
        <Input
          id="child-name"
          {...register('name')}
          placeholder="Child's name"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="child-age">Age</Label>
          <Input
            id="child-age"
            type="number"
            min={4}
            max={18}
            {...register('age', { valueAsNumber: true })}
            placeholder="8"
            disabled={isLoading}
          />
          {errors.age && (
            <p className="text-sm text-destructive">{errors.age.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="child-grade">Grade</Label>
          <Select
            value={grade}
            onValueChange={(v) => setValue('grade', v)}
            disabled={isLoading}
          >
            <SelectTrigger id="child-grade">
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {GRADE_OPTIONS.map((g) => (
                <SelectItem key={g} value={g}>
                  {g === 'K' ? 'Kindergarten' : `Grade ${g}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.grade && (
            <p className="text-sm text-destructive">{errors.grade.message}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Learning preferences</Label>
        <p className="text-xs text-muted-foreground">
          Select at least one. Multiple allowed.
        </p>
        <div className="flex flex-wrap gap-2">
          {LEARNING_PREFERENCE_OPTIONS.map((opt) => {
            const selected = (learningPreferences ?? []).includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => togglePreference(opt.value)}
                disabled={isLoading}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                  selected
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
        {errors.learningPreferences && (
          <p className="text-sm text-destructive">
            {errors.learningPreferences.message}
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
