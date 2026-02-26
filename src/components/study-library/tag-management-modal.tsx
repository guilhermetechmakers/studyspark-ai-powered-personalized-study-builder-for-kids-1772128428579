/**
 * TagManagementModal - Add/remove tags for a study with color chips.
 * Playful, child-friendly design with pill-shaped controls.
 */

import { useState, useEffect } from 'react'
import { X, Plus, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { TagType } from '@/types/study-library'

const TAG_COLORS = [
  '#A9A6F9',
  '#FFAD5A',
  '#FFB085',
  '#5B57A5',
  '#FFF5A5',
  '#FFE7CF',
  '#86EFAC',
  '#93C5FD',
]

export interface TagManagementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studyId: string
  studyTitle: string
  currentTagIds: string[]
  allTags: TagType[]
  onSave: (studyId: string, tagIds: string[]) => Promise<boolean>
  onCreateTag?: (name: string, color?: string) => Promise<TagType | null>
  className?: string
}

export function TagManagementModal({
  open,
  onOpenChange,
  studyId,
  studyTitle,
  currentTagIds,
  allTags,
  onSave,
  onCreateTag,
  className,
}: TagManagementModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0])
  const [isSaving, setIsSaving] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const tagList = allTags ?? []

  useEffect(() => {
    if (open) {
      setSelectedIds(new Set(currentTagIds ?? []))
    }
  }, [open, currentTagIds])

  const handleToggle = (tagId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(tagId)) next.delete(tagId)
      else next.add(tagId)
      return next
    })
  }

  const handleCreateTag = async () => {
    const name = newTagName?.trim()
    if (!name || !onCreateTag) return
    setIsCreating(true)
    try {
      const created = await onCreateTag(name, newTagColor)
      if (created) {
        setSelectedIds((prev) => new Set([...prev, created.id]))
        setNewTagName('')
        setNewTagColor(TAG_COLORS[0])
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const ok = await onSave(studyId, Array.from(selectedIds))
      if (ok) onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-md rounded-2xl border-border bg-card shadow-card',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          className
        )}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Tag className="h-5 w-5 text-primary" />
            Manage tags
          </DialogTitle>
          <DialogDescription>
            Add or remove tags for &quot;{studyTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-wrap gap-2">
            {tagList.map((tag) => {
              const isSelected = selectedIds.has(tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleToggle(tag.id)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-all',
                    'hover:scale-105 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isSelected
                      ? 'ring-2 ring-primary/50 shadow-sm'
                      : 'opacity-70 hover:opacity-100'
                  )}
                  style={{
                    backgroundColor: (tag.color ?? '#A9A6F9') + '40',
                    color: isSelected ? 'rgb(var(--foreground))' : 'rgb(var(--muted-foreground))',
                    borderColor: tag.color ?? '#A9A6F9',
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: tag.color ?? '#A9A6F9' }}
                  />
                  {tag.name}
                  {isSelected && <X className="h-3 w-3" />}
                </button>
              )
            })}
          </div>

          {onCreateTag && (
            <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
              <Label className="text-sm font-medium">Create new tag</Label>
              <div className="flex gap-2">
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Tag name"
                  className="rounded-xl"
                />
                <div className="flex gap-1">
                  {TAG_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewTagColor(c)}
                      className={cn(
                        'h-8 w-8 rounded-full transition-transform hover:scale-110',
                        newTagColor === c && 'ring-2 ring-foreground ring-offset-2'
                      )}
                      style={{ backgroundColor: c }}
                      aria-label={`Select color ${c}`}
                    />
                  ))}
                </div>
                <Button
                  size="sm"
                  onClick={handleCreateTag}
                  disabled={!newTagName?.trim() || isCreating}
                  className="rounded-full"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-primary hover:bg-primary/90"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
