/**
 * StudyLibraryPage - Content list hub with folders, search, filters, bulk actions.
 */

import { useState, useCallback, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Grid3X3, List, FolderOpen, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  SearchBar,
  FilterPanel,
  StudyGrid,
  FolderTree,
  BulkActionsBar,
  Pagination,
  TagManagementModal,
  AuditLogViewer,
  TagFilterChips,
  QuickCreateStudyDialog,
} from '@/components/study-library'
import {
  useStudyLibrary,
  useStudyLibraryFolders,
  useStudyLibraryFilterOptions,
  useStudyLibraryTags,
  moveStudiesToFolder,
  duplicateStudy,
  exportStudies,
  shareStudies,
  deleteStudies,
} from '@/hooks/use-study-library'
import { moveFolder } from '@/api/study-library'
import {
  createTag,
  setStudyTags,
  bulkAddTagsToStudies,
  fetchAuditLogs,
  createStudyQuick,
} from '@/api/study-library'
import type { StudyLibraryFilters } from '@/types/study-library'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const VIEW_KEY = 'studyspark-library-view'

function getStoredView(): 'grid' | 'list' {
  try {
    const v = localStorage.getItem(VIEW_KEY)
    if (v === 'grid' || v === 'list') return v
  } catch {
    // ignore
  }
  return 'grid'
}

function setStoredView(view: 'grid' | 'list') {
  try {
    localStorage.setItem(VIEW_KEY, view)
  } catch {
    // ignore
  }
}

export function StudyLibraryPage() {
  const [searchParams] = useSearchParams()
  const initialSearch = (searchParams.get('q') ?? '').trim()

  const [view, setView] = useState<'grid' | 'list'>(getStoredView)
  const [folderTreeCollapsed, setFolderTreeCollapsed] = useState(false)
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<StudyLibraryFilters>({
    search: initialSearch,
    folderId: undefined,
  })
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [tagModalStudyId, setTagModalStudyId] = useState<string | null>(null)
  const [auditModalOpen, setAuditModalOpen] = useState(false)
  const [auditResourceId, setAuditResourceId] = useState<string | null>(null)
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      folderId: activeFolderId ?? undefined,
    }))
  }, [activeFolderId])

  const handleViewChange = (v: 'grid' | 'list') => {
    setView(v)
    setStoredView(v)
  }

  const {
    studies,
    totalCount,
    page,
    setPage,
    pageSize,
    isLoading,
    refetch: refetchStudies,
  } = useStudyLibrary(filters)

  const {
    folders,
    createFolder,
    renameFolder,
    deleteFolder,
    refetch: refetchFolders,
  } = useStudyLibraryFolders()

  const filterOptions = useStudyLibraryFilterOptions()
  const { tags: allTags, refetch: refetchTags } = useStudyLibraryTags()

  const studyList = studies ?? []
  const folderList = folders ?? []
  const tagList = allTags ?? []

  const handleManageTags = useCallback((id: string) => {
    setTagModalStudyId(id)
  }, [])

  const handleViewAudit = useCallback((id: string, _title: string) => {
    setAuditResourceId(id)
    setAuditModalOpen(true)
  }, [])

  const handleSelectChange = useCallback((id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (selected) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(studyList.map((s) => s.id)))
  }, [studyList])

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const handleMoveStudies = useCallback(
    async (targetFolderId: string | null) => {
      const ids = Array.from(selectedIds)
      if (ids.length === 0) return
      const ok = await moveStudiesToFolder(ids, targetFolderId)
      if (ok) {
        toast.success(`Moved ${ids.length} studies`)
        refetchFolders()
        refetchStudies()
        handleClearSelection()
      } else {
        toast.error('Failed to move studies')
      }
    },
    [selectedIds, refetchFolders, refetchStudies, handleClearSelection]
  )

  const handleBulkExport = useCallback(async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    setIsExporting(true)
    try {
      const blob = await exportStudies(ids, 'pdf')
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `studies-export-${Date.now()}.pdf`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Export started')
      } else {
        toast.success('Export requested (mock)')
      }
    } catch {
      toast.error('Export failed')
    } finally {
      setIsExporting(false)
    }
  }, [selectedIds])

  const handleBulkShare = useCallback(async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    const result = await shareStudies(ids)
    if (result.success) {
      toast.success(`Shared ${ids.length} studies`)
    } else {
      toast.success('Share requested (mock)')
    }
  }, [selectedIds])

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    setIsDeleting(true)
    const ok = await deleteStudies(ids)
    if (ok) {
      toast.success(`Deleted ${ids.length} studies`)
      handleClearSelection()
      refetchFolders()
      refetchStudies()
    } else {
      toast.success('Delete requested (mock)')
      handleClearSelection()
    }
    setIsDeleting(false)
  }, [selectedIds, handleClearSelection, refetchFolders, refetchStudies])

  const handleDropStudy = useCallback(
    async (studyId: string, folderId: string | null) => {
      const ok = await moveStudiesToFolder([studyId], folderId)
      if (ok) {
        toast.success('Study moved')
        refetchFolders()
        refetchStudies()
      } else {
        toast.success('Study moved (mock)')
        refetchFolders()
        refetchStudies()
      }
    },
    [refetchFolders, refetchStudies]
  )

  const handleDuplicate = useCallback(async (id: string) => {
    const created = await duplicateStudy(id)
    if (created) {
      toast.success('Study duplicated')
      refetchFolders()
    } else {
      toast.success('Duplicate requested (mock)')
    }
  }, [refetchFolders])

  const handleExport = useCallback(async (id: string) => {
    const blob = await exportStudies([id], 'pdf')
    if (blob) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `study-${id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export started')
    } else {
      toast.success('Export requested (mock)')
    }
  }, [])

  const handleShare = useCallback(async (id: string) => {
    const result = await shareStudies([id])
    if (result.success) {
      toast.success('Study shared')
    } else {
      toast.success('Share requested (mock)')
    }
  }, [])

  const handleDeleteClick = useCallback((id: string) => {
    setPendingDeleteId(id)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    const id = pendingDeleteId
    if (!id) return
    setPendingDeleteId(null)
    const ok = await deleteStudies([id])
    if (ok) {
      toast.success('Study deleted')
      refetchFolders()
      refetchStudies()
    } else {
      toast.success('Delete requested (mock)')
      refetchFolders()
      refetchStudies()
    }
  }, [pendingDeleteId, refetchFolders, refetchStudies])

  const handleStarToggle = useCallback((_id: string, _starred: boolean) => {
    toast.success('Starred (mock - persist via API)')
  }, [])

  const tagModalStudy = tagModalStudyId
    ? studyList.find((s) => s.id === tagModalStudyId)
    : null
  const currentTagIdsForModal: string[] = tagModalStudy
    ? ((tagModalStudy.tagObjects ?? []).length > 0
        ? (tagModalStudy.tagObjects ?? []).map((t) => t.id).filter(Boolean)
        : (tagModalStudy.tags ?? [])
            .map((tn) =>
              tagList.find((t) => t.name.toLowerCase() === tn.toLowerCase())?.id
            )
            .filter((id): id is string => id != null))
    : []

  const handleBulkAddTags = useCallback(
    async (tagIds: string[]) => {
      const ids = Array.from(selectedIds)
      if (ids.length === 0 || tagIds.length === 0) return
      const ok = await bulkAddTagsToStudies(ids, tagIds)
      if (ok) {
        toast.success(`Tags added to ${ids.length} studies`)
        handleClearSelection()
        refetchStudies()
      } else {
        toast.error('Failed to add tags')
      }
    },
    [selectedIds, handleClearSelection, refetchStudies]
  )

  const handleSaveTags = useCallback(
    async (studyId: string, tagIds: string[]) => {
      const ok = await setStudyTags(studyId, tagIds)
      if (ok) {
        refetchStudies()
        refetchTags()
      }
      return ok
    },
    [refetchStudies, refetchTags]
  )

  const selectedCount = selectedIds.size

  return (
    <div className="flex h-full min-h-0">
      {!folderTreeCollapsed && (
        <FolderTree
          folders={folderList}
          activeFolderId={activeFolderId}
          onFolderSelect={setActiveFolderId}
          onCreateFolder={(name, parentId) => {
            createFolder(name, parentId)
            toast.success('Folder created')
          }}
          onRenameFolder={(id, name) => {
            renameFolder(id, name)
            toast.success('Folder renamed')
          }}
          onDeleteFolder={(id) => {
            deleteFolder(id)
            toast.success('Folder deleted')
          }}
          onDropStudy={handleDropStudy}
          onMoveFolder={async (folderId, newParentId) => {
            const ok = await moveFolder(folderId, newParentId)
            if (ok) {
              toast.success('Folder moved')
              refetchFolders()
            } else {
              toast.error('Failed to move folder')
            }
          }}
          isCollapsed={folderTreeCollapsed}
          onToggleCollapse={() => setFolderTreeCollapsed(true)}
        />
      )}
      {folderTreeCollapsed && (
        <div className="flex w-12 flex-col border-r border-border bg-card">
          <Button
            variant="ghost"
            size="icon"
            className="mt-4"
            onClick={() => setFolderTreeCollapsed(false)}
            aria-label="Expand folder tree"
          >
            <FolderOpen className="h-5 w-5" />
          </Button>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="space-y-6 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Study Library</h1>
              <p className="text-muted-foreground">
                Organize and manage your study sets
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAuditModalOpen(true)}
                aria-label="View activity log"
              >
                <History className="mr-2 h-4 w-4" />
                Activity
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickCreateOpen(true)}
                aria-label="Quick create study"
              >
                <Plus className="mr-2 h-4 w-4" />
                Quick create
              </Button>
              <Button asChild>
                <Link to="/dashboard/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Study
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <SearchBar
                value={filters.search}
                onChange={(v) => setFilters((prev) => ({ ...prev, search: v }))}
              />
              <div className="flex gap-2">
                <Button
                  variant={view === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => handleViewChange('grid')}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => handleViewChange('list')}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TagFilterChips
              tags={tagList}
              selectedTagIds={filters.tagIds ?? []}
              onToggle={(tagId) => {
                const current = filters.tagIds ?? []
                const next = current.includes(tagId)
                  ? current.filter((id) => id !== tagId)
                  : [...current, tagId]
                setFilters((prev) => ({ ...prev, tagIds: next.length > 0 ? next : undefined }))
              }}
              onClearAll={() =>
                setFilters((prev) => ({ ...prev, tagIds: undefined }))
              }
            />
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              children={filterOptions.children}
              subjects={filterOptions.subjects}
              learningStyles={filterOptions.learningStyles}
              tags={filterOptions.tags}
            />
          </div>

          {selectedCount > 0 && (
            <BulkActionsBar
              selectedCount={selectedCount}
              totalInView={studyList.length}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              onExport={handleBulkExport}
              onShare={handleBulkShare}
              onMove={handleMoveStudies}
              onBulkTag={handleBulkAddTags}
              onDelete={handleBulkDelete}
              folders={folderList}
              tags={tagList}
              isExporting={isExporting}
              isDeleting={isDeleting}
            />
          )}

          {isLoading ? (
            <div
              className={cn(
                view === 'grid'
                  ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'flex flex-col gap-2'
              )}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="mb-4 h-24 w-full rounded-xl" />
                    <Skeleton className="mb-2 h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : studyList.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(var(--peach-light))] to-[rgb(var(--lavender))]/30">
                  <FolderOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  No studies yet
                </h3>
                <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                  Create your first study set to get started. Upload teacher
                  materials and let AI generate personalized content.
                </p>
                <Button className="mt-6" asChild>
                  <Link to="/dashboard/create">Create Study</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <StudyGrid
                studies={studyList}
                view={view}
                selectedIds={selectedIds}
                onSelectChange={handleSelectChange}
                onDuplicate={handleDuplicate}
                onExport={handleExport}
                onShare={handleShare}
                onDelete={handleDeleteClick}
                onStarToggle={handleStarToggle}
                onManageTags={handleManageTags}
                onViewAudit={handleViewAudit}
                allTags={tagList}
              />
              <Pagination
                page={page}
                pageSize={pageSize}
                totalCount={totalCount}
                onPageChange={setPage}
                isLoading={isLoading}
              />
            </>
          )}
        </div>
      </div>

      <Dialog open={!!pendingDeleteId} onOpenChange={(o) => !o && setPendingDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete study</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this study? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TagManagementModal
        open={!!tagModalStudyId}
        onOpenChange={(o) => !o && setTagModalStudyId(null)}
        studyId={tagModalStudyId ?? ''}
        studyTitle={tagModalStudy?.title ?? tagModalStudy?.id ?? ''}
        currentTagIds={currentTagIdsForModal}
        allTags={tagList}
        onSave={handleSaveTags}
        onCreateTag={createTag}
      />

      <AuditLogViewer
        open={auditModalOpen}
        onOpenChange={setAuditModalOpen}
        resourceType={auditResourceId ? 'study' : undefined}
        resourceId={auditResourceId ?? undefined}
        fetchLogs={(params) =>
          fetchAuditLogs(params?.resourceType, params?.resourceId, params?.limit)
        }
      />

      <QuickCreateStudyDialog
        open={quickCreateOpen}
        onOpenChange={setQuickCreateOpen}
        onCreate={async (title, folderId) => {
          const study = await createStudyQuick(title, folderId)
          return study ? { id: study.id } : null
        }}
        folders={folderList}
        defaultFolderId={activeFolderId}
      />
    </div>
  )
}
