import { useState, useCallback, useEffect, useRef } from 'react'
import { Pencil, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { SectionBlock, SectionContent } from '@/types/study-review'
import { SECTION_TYPE_LABELS } from '@/types/study-review'
import { dataGuard } from '@/lib/data-guard'
import { AutosaveIndicator } from './autosave-indicator'
import type { AutosaveStatus } from '@/types/review-workflow'

const AUTOSAVE_DEBOUNCE_MS = 20000

function getContentAsString(content: string | SectionContent | null | undefined): string {
  if (typeof content === 'string') return content
  if (!content) return ''
  if (content.summary) return content.summary
  const obj = content as SectionContent
  if (Array.isArray(obj.lessons)) {
    return obj.lessons.map((l) => `${l.title ?? ''}\n${l.body ?? ''}`).join('\n\n')
  }
  if (Array.isArray(obj.flashcards)) {
    return obj.flashcards.map((f) => `${f.front ?? ''} / ${f.back ?? ''}`).join('\n')
  }
  if (Array.isArray(obj.quizzes)) {
    return obj.quizzes.map((q) => `${q.question ?? ''} → ${q.answer ?? ''}`).join('\n')
  }
  return JSON.stringify(content)
}

export interface InlineBlockEditorProps {
  blocks: SectionBlock[]
  onBlocksChange: (blocks: SectionBlock[]) => void
  onBlockSave?: (blockId: string, content: string | SectionContent | Record<string, unknown>) => Promise<void>
  onRequestRevision?: () => void
  autosaveStatus?: AutosaveStatus
  selectedBlockIds?: string[]
  onSelectBlocks?: (ids: string[]) => void
  className?: string
}

export function InlineBlockEditor({
  blocks,
  onBlocksChange,
  onBlockSave,
  onRequestRevision,
  autosaveStatus,
  selectedBlockIds = [],
  onSelectBlocks,
  className,
}: InlineBlockEditorProps) {
  const safeBlocks = dataGuard(blocks)
  const sortedBlocks = [...safeBlocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [localStatus, setLocalStatus] = useState<AutosaveStatus>({ status: 'idle' })
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const status = autosaveStatus ?? localStatus

  const handleBlockUpdate = useCallback(
    (blockId: string, content: string | SectionContent | Record<string, unknown>) => {
      onBlocksChange(
        safeBlocks.map((b) =>
          b.id === blockId ? { ...b, content } : b
        )
      )
    },
    [onBlocksChange, safeBlocks]
  )

  const triggerSave = useCallback(
    async (blockId: string, content: string | SectionContent | Record<string, unknown>) => {
      if (!onBlockSave) return
      setLocalStatus({ status: 'saving' })
      try {
        await onBlockSave(blockId, content)
        setLocalStatus({ status: 'saved', lastSavedAt: new Date().toISOString() })
      } catch {
        setLocalStatus({ status: 'error' })
      }
    },
    [onBlockSave]
  )

  const handleBlur = useCallback(
    (blockId: string) => {
      const block = sortedBlocks.find((b) => b.id === blockId)
      if (!block) return
      let content: string | SectionContent | Record<string, unknown> = editValue
      try {
        const parsed = JSON.parse(editValue)
        if (typeof parsed === 'object') content = parsed
      } catch {
        // keep as string
      }
      handleBlockUpdate(blockId, content)
      triggerSave(blockId, content)
      setEditingBlockId(null)
    },
    [sortedBlocks, editValue, handleBlockUpdate, triggerSave]
  )

  useEffect(() => {
    if (editingBlockId && onBlockSave) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        const block = sortedBlocks.find((b) => b.id === editingBlockId)
        if (block) {
          handleBlockUpdate(editingBlockId, editValue)
          triggerSave(editingBlockId, editValue)
        }
        debounceRef.current = null
      }, AUTOSAVE_DEBOUNCE_MS)
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [editingBlockId, editValue, onBlockSave, sortedBlocks, handleBlockUpdate, triggerSave])

  const handleToggleSelect = useCallback(
    (blockId: string) => {
      if (!onSelectBlocks) return
      const next = new Set(selectedBlockIds)
      if (next.has(blockId)) next.delete(blockId)
      else next.add(blockId)
      onSelectBlocks(Array.from(next))
    },
    [onSelectBlocks, selectedBlockIds]
  )

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between gap-4">
        {onBlockSave && (
          <AutosaveIndicator status={status} />
        )}
        {onRequestRevision && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRequestRevision}
            className="rounded-full"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Request AI revision
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {sortedBlocks.map((block) => {
          const isEditing = editingBlockId === block.id
          const isSelected = selectedBlockIds.includes(block.id)
          const content = block.content ?? ''
          const text = getContentAsString(content)
          const label = SECTION_TYPE_LABELS[block.type as keyof typeof SECTION_TYPE_LABELS] ?? block.type

          return (
            <Card
              key={block.id}
              className={cn(
                'overflow-hidden rounded-2xl border-2 transition-all duration-200',
                'bg-gradient-to-br from-[rgb(var(--peach-light))]/20 to-white',
                'hover:shadow-card-hover',
                isSelected && 'ring-2 ring-primary/50'
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
                <div className="flex gap-2">
                  {onSelectBlocks && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleSelect(block.id)}
                      className={isSelected ? 'bg-primary/10' : ''}
                      aria-label={isSelected ? 'Deselect block' : 'Select block for revision'}
                    >
                      Select
                    </Button>
                  )}
                  {!isEditing ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingBlockId(block.id)
                        setEditValue(text)
                      }}
                      aria-label={`Edit ${label}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBlur(block.id)}
                    >
                      Done
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleBlur(block.id)}
                    rows={6}
                    className="rounded-xl border-2"
                    autoFocus
                  />
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap">{text || 'No content yet.'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
