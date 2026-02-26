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
import { LEARNING_STYLE_OPTIONS, type ChildProfile } from '@/types/settings'
import type { LearningStyle } from '@/types/study-wizard'

const childProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z
    .number({ invalid_type_error: 'Age must be a number' })
    .min(0, 'Age must be 0–18')
    .max(18, 'Age must be 0–18'),
  grade: z.string().min(1, 'Grade is required'),
  learningStyle: z.enum([
    'playful',
    'exam-like',
    'research-based',
    'printable',
    'interactive',
  ] as const),
})

export type ChildProfileFormValues = z.infer<typeof childProfileSchema>

export interface ChildProfileFormProps {
  defaultValues?: Partial<ChildProfile>
  onSubmit: (values: ChildProfileFormValues) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
  submitLabel?: string
}

export function ChildProfileForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save',
}: ChildProfileFormProps) {
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
      grade: defaultValues?.grade ?? '',
      learningStyle: (defaultValues?.learningStyle ?? 'playful') as LearningStyle,
    },
  })

  const learningStyle = watch('learningStyle')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            min={0}
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
          <Input
            id="child-grade"
            {...register('grade')}
            placeholder="e.g. 3"
            disabled={isLoading}
          />
          {errors.grade && (
            <p className="text-sm text-destructive">{errors.grade.message}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="child-learning-style">Learning style</Label>
        <Select
          value={learningStyle}
          onValueChange={(v) => setValue('learningStyle', v as LearningStyle)}
          disabled={isLoading}
        >
          <SelectTrigger id="child-learning-style">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            {(LEARNING_STYLE_OPTIONS ?? []).map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
