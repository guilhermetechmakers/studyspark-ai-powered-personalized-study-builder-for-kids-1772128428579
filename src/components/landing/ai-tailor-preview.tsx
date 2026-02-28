import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const GRADE_OPTIONS = [
  { value: 'k', label: 'Kindergarten' },
  { value: '1', label: 'Grade 1' },
  { value: '2', label: 'Grade 2' },
  { value: '3', label: 'Grade 3' },
  { value: '4', label: 'Grade 4' },
  { value: '5', label: 'Grade 5' },
  { value: '6', label: 'Grade 6' },
  { value: '7', label: 'Grade 7' },
  { value: '8', label: 'Grade 8' },
]

const TAILOR_PREVIEWS: Record<string, string> = {
  k: 'Tailored for Kindergarten: Simple words, short sentences, playful visuals.',
  '1': 'Tailored for Grade 1: Basic vocabulary, picture cues, short activities.',
  '2': 'Tailored for Grade 2: Growing vocabulary, simple paragraphs, fun facts.',
  '3': 'Tailored for Grade 3: Age-appropriate reading level, engaging examples.',
  '4': 'Tailored for Grade 4: More complex concepts, structured explanations.',
  '5': 'Tailored for Grade 5: Intermediate vocabulary, detailed content.',
  '6': 'Tailored for Grade 6: Advanced vocabulary, analytical prompts.',
  '7': 'Tailored for Grade 7: Middle school level, critical thinking focus.',
  '8': 'Tailored for Grade 8: Pre-high school readiness, comprehensive content.',
}

/**
 * AI Tailor Preview: dropdown to simulate how content would be tailored.
 * Updates preview text (e.g., "Tailored for grade X").
 */
export function AITailorPreview() {
  const [grade, setGrade] = useState('3')

  const previewText = TAILOR_PREVIEWS[grade] ?? TAILOR_PREVIEWS['3']

  return (
    <Card
      className="animate-fade-in-up"
      role="region"
      aria-labelledby="ai-tailor-heading"
      aria-describedby="ai-tailor-desc"
    >
      <CardHeader>
        <CardTitle id="ai-tailor-heading" className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-[rgb(var(--tangerine))]" aria-hidden />
          AI Tailor Preview
        </CardTitle>
        <p id="ai-tailor-desc" className="text-sm text-muted-foreground">
          See how content adapts to your child&apos;s grade level.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="grade-select" className="text-sm font-medium">
            Select grade
          </label>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger
              id="grade-select"
              className="w-full"
              aria-label="Select grade level for content tailoring"
            >
              <SelectValue placeholder="Choose grade" />
            </SelectTrigger>
            <SelectContent>
              {GRADE_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  aria-label={opt.label}
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-border bg-gradient-to-br from-[rgb(var(--lavender))]/10 to-[rgb(var(--tangerine))]/10 p-4">
          <p className="text-sm font-medium text-foreground">{previewText}</p>
        </div>
      </CardContent>
    </Card>
  )
}
