/**
 * FolderTree - Collapsible tree with create/rename/delete and drag-drop.
 */

import { useState, useCallback } from 'react'
import {
  ChevronRight,
  ChevronDown,
  FolderPlus,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { FolderType } from '@/types/study-library'

export interface FolderTreeProps {
  folders: FolderType[]
  activeFolderId: string | null
  onFolderSelect: (folderId: string | null) => void
  onCreateFolder: (name: string, parentId?: string | null) => void
  onRenameFolder: (id: string, name: string) => void
  onDeleteFolder: (id: string) => void
  onDropStudy?: (studyId: string, folderId: string | null) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
}

function buildTree(folders: FolderType[]): FolderType[] {
  const list = folders ?? []
  const byParent = new Map<string | null, FolderType[]>()
  byParent.set(null, [])
  for (const f of list) {
    const pid = f.parentFolderId ?? null
    if (!byParent.has(pid)) byParent.set(pid, [])
    byParent.get(pid)!.push(f)
  }
  for (const arr of byParent.values()) {
    arr.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  }
  return byParent.get(null) ?? []
}

function getChildren(folders: FolderType[], parentId: string): FolderType[] {
  const list = folders ?? []
  return list
    .filter((f) => (f.parentFolderId ?? null) === parentId)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
}

interface FolderItemProps {
  folder: FolderType
  folders: FolderType[]
  activeFolderId: string | null
  onSelect: (id: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onDropStudy?: (studyId: string, folderId: string) => void
  depth: number
}

function FolderItem({
  folder,
  folders,
  activeFolderId,
  onSelect,
  onRename,
  onDelete,
  onDropStudy,
  depth,
}: FolderItemProps) {
  const [expanded, setExpanded] = useState(true)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(folder.name)
  const [dragOver, setDragOver] = useState(false)

  const children = getChildren(folders, folder.id)
  const hasChildren = children.length > 0
  const isActive = activeFolderId === folder.id

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const studyId = e.dataTransfer.getData('study-id')
    if (studyId && onDropStudy) {
      onDropStudy(studyId, folder.id)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const handleRenameSubmit = () => {
    const trimmed = renameValue?.trim() ?? ''
    if (trimmed && trimmed !== folder.name) {
      onRename(folder.id, trimmed)
    }
    setIsRenaming(false)
  }

  return (
    <div className="select-none">
      <div
        className={cn(
          'group flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm transition-colors',
          isActive && 'bg-primary/10 text-primary',
          !isActive && 'hover:bg-muted',
          dragOver && 'ring-2 ring-primary/50 bg-primary/5'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onDrop={onDropStudy ? handleDrop : undefined}
        onDragOver={onDropStudy ? handleDragOver : undefined}
        onDragLeave={onDropStudy ? handleDragLeave : undefined}
      >
        <button
          type="button"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-muted"
          onClick={() => setExpanded((x) => !x)}
          aria-expanded={expanded}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <span className="w-4" />
          )}
        </button>
        {isRenaming ? (
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit()
              if (e.key === 'Escape') {
                setRenameValue(folder.name)
                setIsRenaming(false)
              }
            }}
            className="h-7 flex-1 text-sm"
            autoFocus
          />
        ) : (
          <>
            <button
              type="button"
              className="flex flex-1 items-center gap-2 truncate text-left"
              onClick={() => onSelect(folder.id)}
            >
              <FolderOpen
                className="h-4 w-4 shrink-0"
                style={{ color: folder.color ?? 'inherit' }}
              />
              <span className="truncate">{folder.name}</span>
              {(folder.childCount ?? 0) > 0 && (
                <span className="text-xs text-muted-foreground">
                  {folder.childCount}
                </span>
              )}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Folder actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(folder.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
      {expanded && hasChildren && (
        <div>
          {(children ?? []).map((c) => (
            <FolderItem
              key={c.id}
              folder={c}
              folders={folders}
              activeFolderId={activeFolderId}
              onSelect={onSelect}
              onRename={onRename}
              onDelete={onDelete}
              onDropStudy={onDropStudy}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FolderTree({
  folders,
  activeFolderId,
  onFolderSelect,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onDropStudy,
  isCollapsed = false,
  onToggleCollapse,
  className,
}: FolderTreeProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const rootFolders = buildTree(folders)

  const handleCreate = useCallback(() => {
    const trimmed = newFolderName?.trim() ?? ''
    if (trimmed) {
      onCreateFolder(trimmed, null)
      setNewFolderName('')
      setShowCreate(false)
    }
  }, [newFolderName, onCreateFolder])

  if (isCollapsed) {
    return (
      <div className={cn('flex flex-col items-center py-4', className)}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          aria-label="Expand folder tree"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex w-56 flex-col border-r border-border bg-card',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-sm font-semibold text-foreground">Folders</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowCreate(true)}
            aria-label="Create folder"
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onToggleCollapse}
              aria-label="Collapse folder tree"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <button
          type="button"
          className={cn(
            'flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors',
            activeFolderId === null ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
          )}
          onClick={() => onFolderSelect(null)}
        >
          <FolderOpen className="h-4 w-4" />
          All Studies
        </button>
        {(rootFolders ?? []).map((f) => (
          <FolderItem
            key={f.id}
            folder={f}
            folders={folders}
            activeFolderId={activeFolderId}
            onSelect={onFolderSelect}
            onRename={onRenameFolder}
            onDelete={onDeleteFolder}
            onDropStudy={onDropStudy}
            depth={0}
          />
        ))}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-folder-name">Folder name</Label>
              <Input
                id="new-folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="My folder"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newFolderName?.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
