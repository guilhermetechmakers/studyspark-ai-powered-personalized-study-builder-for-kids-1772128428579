import { useState, useCallback, useRef, type KeyboardEvent } from 'react'
import { Plus, X, Save, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Build-a-Plan widget: days range input, subjects tag input, generated plan summary.
 * Quick actions: Save, Start over.
 */
export function BuildAPlanWidget() {
  const [days, setDays] = useState(7)
  const [subjects, setSubjects] = useState<string[]>(['Math', 'Science'])
  const [inputValue, setInputValue] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addSubject = useCallback(() => {
    const trimmed = inputValue.trim()
    if (trimmed && !subjects.includes(trimmed)) {
      setSubjects((prev) => [...prev, trimmed])
      setInputValue('')
    }
  }, [inputValue, subjects])

  const removeSubject = useCallback((subject: string) => {
    setSubjects((prev) => prev.filter((s) => s !== subject))
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        addSubject()
      }
    },
    [addSubject]
  )

  const handleStartOver = useCallback(() => {
    setDays(7)
    setSubjects(['Math', 'Science'])
    setIsSaved(false)
  }, [])

  const handleSave = useCallback(() => {
    setIsSaved(true)
  }, [])

  const planSummary = `${days}-day plan with ${subjects.join(', ')}`

  return (
    <Card
      className="animate-fade-in-up"
      role="region"
      aria-labelledby="build-a-plan-heading"
      aria-describedby="build-a-plan-desc"
    >
      <CardHeader>
        <CardTitle id="build-a-plan-heading" className="text-lg">
          Build a Plan
        </CardTitle>
        <p id="build-a-plan-desc" className="text-sm text-muted-foreground">
          Customize your study plan. Add subjects and set the duration.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Days range */}
        <div className="space-y-2">
          <Label htmlFor="plan-days" className="text-sm font-medium">
            Number of days: {days}
          </Label>
          <input
            id="plan-days"
            type="range"
            min={3}
            max={30}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            aria-valuemin={3}
            aria-valuemax={30}
            aria-valuenow={days}
            aria-valuetext={`${days} days`}
          />
        </div>

        {/* Subjects tag input */}
        <div className="space-y-2">
          <Label htmlFor="plan-subjects" className="text-sm font-medium">
            Subjects
          </Label>
          <div className="flex flex-wrap gap-2 rounded-lg border border-input bg-background p-2">
            {subjects.map((subject) => (
              <span
                key={subject}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
              >
                {subject}
                <button
                  type="button"
                  onClick={() => removeSubject(subject)}
                  className="rounded-full p-0.5 transition-colors hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label={`Remove ${subject}`}
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </span>
            ))}
            <div className="flex flex-1 items-center gap-1">
              <Input
                ref={inputRef}
                id="plan-subjects"
                type="text"
                placeholder="Add subject..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-w-[120px] flex-1 border-0 bg-transparent px-2 py-1 text-sm focus-visible:ring-0"
                aria-label="Add a subject"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addSubject}
                className="h-8 w-8 p-0"
                aria-label="Add subject"
              >
                <Plus className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>

        {/* Generated plan summary */}
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-sm font-medium text-foreground">Generated plan</p>
          <p className="mt-1 text-sm text-muted-foreground">{planSummary}</p>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaved}
            className="transition-all duration-200 hover:scale-[1.02]"
            aria-pressed={isSaved}
          >
            <Save className="mr-1.5 h-4 w-4" aria-hidden />
            {isSaved ? 'Saved' : 'Save'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleStartOver}
            className="transition-all duration-200 hover:scale-[1.02]"
            aria-label="Start over and reset plan"
          >
            <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden />
            Start over
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
