'use client'

import { useState, useCallback } from 'react'
import {
  Plus,
  Trash2,
  GripVertical,
  Pencil,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { StudyCard } from '@/types/study-customization'

interface ContentManagerProps {
  cards: StudyCard[]
  onCardsChange: (cards: StudyCard[]) => void
  disabled?: boolean
  className?: string
}

const CARD_TEMPLATES = [
  { id: 'basic', label: 'Basic Q&A' },
  { id: 'definition', label: 'Term & Definition' },
  { id: 'vocabulary', label: 'Vocabulary' },
]

function generateId(): string {
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function ContentManager({
  cards,
  onCardsChange,
  disabled = false,
  className,
}: ContentManagerProps) {
  const [editingCard, setEditingCard] = useState<StudyCard | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')

  const handleAdd = useCallback(() => {
    if (!newQuestion.trim() || !newAnswer.trim()) return
    const card: StudyCard = {
      id: generateId(),
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      template: 'basic',
    }
    onCardsChange([...cards, card])
    setNewQuestion('')
    setNewAnswer('')
    setIsAddOpen(false)
  }, [cards, newQuestion, newAnswer, onCardsChange])

  const handleEdit = useCallback(
    (card: StudyCard) => {
      if (disabled) return
      setEditingCard(card)
    },
    [disabled]
  )

  const handleSaveEdit = useCallback(
    (card: StudyCard, question: string, answer: string) => {
      const updated = cards.map((c) =>
        c.id === card.id ? { ...c, question, answer } : c
      )
      onCardsChange(updated)
      setEditingCard(null)
    },
    [cards, onCardsChange]
  )

  const handleDelete = useCallback(
    (id: string) => {
      onCardsChange(cards.filter((c) => c.id !== id))
    },
    [cards, onCardsChange]
  )

  const handleMove = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= cards.length) return
      const next = [...cards]
      ;[next[index], next[newIndex]] = [next[newIndex]!, next[index]!]
      onCardsChange(next)
    },
    [cards, onCardsChange]
  )

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Study Cards</h3>
        <Button
          size="sm"
          onClick={() => setIsAddOpen(true)}
          disabled={disabled}
          className="gap-2"
          aria-label="Add card"
        >
          <Plus className="h-4 w-4" />
          Add Card
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">
          {cards.length} card{cards.length !== 1 ? 's' : ''}
        </Label>
        <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-border bg-muted/30 p-2">
          {cards.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No cards yet. Add one to get started.
            </p>
          ) : (
            cards.map((card, index) => (
              <div
                key={card.id}
                className={cn(
                  'flex items-center gap-2 rounded-xl border border-border bg-card p-3 transition-all',
                  'hover:border-primary/50 hover:shadow-sm'
                )}
              >
                {!disabled && (
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="rounded p-1 hover:bg-muted disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{card.question}</p>
                  {card.imageUrl && (
                    <span className="text-xs text-muted-foreground">Has image</span>
                  )}
                </div>
                {!disabled && (
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(card)}
                      aria-label="Edit card"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(card.id)}
                      aria-label="Delete card"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Card templates</Label>
        <div className="flex flex-wrap gap-2">
          {CARD_TEMPLATES.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
            >
              <FileText className="h-4 w-4 text-muted-foreground" />
              {t.label}
            </span>
          ))}
        </div>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md" aria-label="Add card">
          <DialogHeader>
            <DialogTitle>Add Study Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-question">Question</Label>
              <Input
                id="new-question"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Type the question..."
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-answer">Answer</Label>
              <Textarea
                id="new-answer"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Type the answer..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!newQuestion.trim() || !newAnswer.trim()}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingCard && (
        <EditCardDialog
          card={editingCard}
          onSave={(q, a) => handleSaveEdit(editingCard, q, a)}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  )
}

function EditCardDialog({
  card,
  onSave,
  onClose,
}: {
  card: StudyCard
  onSave: (question: string, answer: string) => void
  onClose: () => void
}) {
  const [question, setQuestion] = useState(card.question)
  const [answer, setAnswer] = useState(card.answer)

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" aria-label="Edit card">
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-question">Question</Label>
            <Input
              id="edit-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-answer">Answer</Label>
            <Textarea
              id="edit-answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(question, answer)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
