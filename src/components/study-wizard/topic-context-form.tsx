import { useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SUBJECTS, type TopicContext } from '@/types/study-wizard'
import { cn } from '@/lib/utils'

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
    [value, onChange]
  )

  const previewSummary = [
    topic && `Topic: ${topic}`,
    subject && `Subject: ${subject}`,
    examDate && `Exam date: ${new Date(examDate).toLocaleDateString()}`,
    contextNotes && `Notes: ${contextNotes.slice(0, 80)}${contextNotes.length > 80 ? '...' : ''}`,
  ]
    .filter(Boolean)
    .join(' • ') || 'Enter topic and context to see preview.'

  return (
    <div className={cn('space-y-6', className)}>
      <Card className="overflow-hidden border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--peach-light))]/30 to-white">
        <CardHeader>
          <CardTitle>Topic & Context</CardTitle>
          <CardDescription>
            What is the exam or topic? Add any context from the teacher.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">
              Topic / Exam name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="topic"
              placeholder="e.g. Fractions & Decimals, World War II"
              value={topic}
              onChange={(e) => update({ topic: e.target.value })}
              aria-invalid={!!errors.topic}
              aria-describedby={errors.topic ? 'topic-error' : undefined}
              className={errors.topic ? 'border-destructive' : ''}
            />
            {errors.topic && (
              <p id="topic-error" className="text-sm text-destructive">
                {errors.topic}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject / Category</Label>
            <Select value={subject} onValueChange={(v) => update({ subject: v })}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {(SUBJECTS ?? []).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Exam date, key concepts, teacher instructions..."
              value={contextNotes}
              onChange={(e) => update({ contextNotes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="examDate">Estimated exam date (optional)</Label>
            <Input
              id="examDate"
              type="date"
              value={examDate}
              onChange={(e) => update({ examDate: e.target.value || undefined })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 bg-[rgb(var(--peach-light))]/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Live Preview</CardTitle>
          <CardDescription>Summary of your study topic and context</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{previewSummary}</p>
        </CardContent>
      </Card>
    </div>
  )
}
