/**
 * BulkActionsBar - Export, Share, Move, Delete for selected studies.
 */

import { useState } from 'react'
import { Download, Share2, FolderInput, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { FolderType } from '@/types/study-library'

export interface BulkActionsBarProps {
  selectedCount: number
  totalInView: number
  onSelectAll: () => void
  onClearSelection: () => void
  onExport: () => void
  onShare: () => void
  onMove: (folderId: string | null) => void
  onDelete: () => void
  folders: FolderType[]
  isExporting?: boolean
  isDeleting?: boolean
  className?: string
}

export function BulkActionsBar({
  selectedCount,
  totalInView,
  onSelectAll,
  onClearSelection,
  onExport,
  onShare,
  onMove,
  onDelete,
  folders,
  isExporting = false,
  isDeleting = false,
  className,
}: BulkActionsBarProps) {
  const [moveFolderId, setMoveFolderId] = useState<string>('')
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const folderList = folders ?? []
  const canSelectAll = selectedCount < totalInView

  const handleMoveConfirm = () => {
    const target = moveFolderId === 'none' || !moveFolderId ? null : moveFolderId
    onMove(target)
    setMoveFolderId('')
    setShowMoveDialog(false)
  }

  const selectedText = String(selectedCount) + ' selected'
  const deleteConfirmText =
    'Are you sure you want to delete ' +
    selectedCount +
    ' study' +
    (selectedCount !== 1 ? 'ies' : '') +
    '? This action cannot be undone.'

  return (
    <div className="space-y-0">
      <div
        className={cn(
          'flex flex-wrap items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3',
          'animate-fade-in',
          className
        )}
      >
        <span className="text-sm font-medium text-foreground">{selectedText}</span>
        {canSelectAll && (
          <Button variant="ghost" size="sm" onClick={onSelectAll}>
            Select all in view
          </Button>
        )}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onExport}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="secondary" size="sm" onClick={onShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowMoveDialog(true)}
          >
            <FolderInput className="mr-2 h-4 w-4" />
            Move
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
        <Button variant="ghost" size="icon" onClick={onClearSelection}>
          <X className="h-4 w-4" />
          <span className="sr-only">Clear selection</span>
        </Button>
      </div>

      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to folder</DialogTitle>
            <DialogDescription>
              Choose a folder to move the selected studies to.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={moveFolderId || 'none'} onValueChange={setMoveFolderId}>
              <SelectTrigger>
                <SelectValue placeholder="Select folder" />
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMoveConfirm}>Move</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete studies</DialogTitle>
            <DialogDescription>{deleteConfirmText}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete()
                setShowDeleteDialog(false)
              }}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
