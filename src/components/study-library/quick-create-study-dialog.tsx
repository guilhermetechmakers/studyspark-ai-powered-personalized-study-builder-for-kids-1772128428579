/**
 * QuickCreateStudyDialog - Minimal create study with title and folder.
 * Playful, child-friendly design with pill-shaped controls.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderOpen } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { FolderType } from '@/types/study-library'

export interface QuickCreateStudyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (title: string, folderId?: string | null) => Promise<{ id: string } | null>
  folders: FolderType[]
  defaultFolderId?: string | null
  className?: string
}

export function QuickCreateStudyDialog({
  open,
  onOpenChange,
  onCreate,
  folders,
  defaultFolderId,
  className,
}: QuickCreateStudyDialogProps) {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [folderId, setFolderId] = useState<string | null>(defaultFolderId ?? null)
  const [isCreating, setIsCreating] = useState(false)

  const folderList = folders ?? []

  const handleCreate = async () => {
    const trimmed = title?.trim()
    if (!trimmed) return
    setIsCreating(true)
    try {
      const created = await onCreate(trimmed, folderId)
      if (created?.id) {
        onOpenChange(false)
        setTitle('')
        setFolderId(defaultFolderId ?? null)
        navigate(`/dashboard/studies/${created.id}`)
      }
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-md rounded-2xl border-border bg-card shadow-card',
          'animate-fade-in',
          className
        )}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Plus className="h-5 w-5 text-primary" />
            Quick create study
          </DialogTitle>
          <DialogDescription>
            Add a new study with a title. You can add content and customize it later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quick-create-title">Title</Label>
            <Input
              id="quick-create-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Math - Fractions"
              className="rounded-xl"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
              }}
            />
          </div>

          {folderList.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <FolderOpen className="h-4 w-4" />
                Folder
              </Label>
              <Select
                value={folderId ?? 'none'}
                onValueChange={(v) => setFolderId(v === 'none' ? null : v)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="No folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No folder (Unfiled)</SelectItem>
                  {folderList.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!title?.trim() || isCreating}
            className="rounded-xl bg-primary hover:bg-primary/90"
          >
            {isCreating ? 'Creating…' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
