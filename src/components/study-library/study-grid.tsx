/**
 * StudyGrid / StudyListView - Grid or list rendering of StudyCard.
 */

import { StudyCard } from './study-card'
import { cn } from '@/lib/utils'
import type { StudyCardType } from '@/types/study-library'

export interface StudyGridProps {
  studies: StudyCardType[]
  view: 'grid' | 'list'
  selectedIds: Set<string>
  onSelectChange: (id: string, selected: boolean) => void
  onDuplicate?: (id: string) => void
  onExport?: (id: string) => void
  onShare?: (id: string) => void
  onDelete?: (id: string) => void
  onStarToggle?: (id: string, starred: boolean) => void
  onManageTags?: (id: string) => void
  onViewAudit?: (id: string, title: string) => void
  onDragStart?: (id: string) => void
  onDragEnd?: () => void
  allTags?: { id: string; name: string; color?: string }[]
  className?: string
}

export function StudyGrid({
  studies,
  view,
  selectedIds,
  onSelectChange,
  onDuplicate,
  onExport,
  onShare,
  onDelete,
  onStarToggle,
  onManageTags,
  onViewAudit,
  onDragStart,
  onDragEnd,
  allTags = [],
  className,
}: StudyGridProps) {
  const list = studies ?? []

  return (
    <div
      className={cn(
        view === 'grid'
          ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'flex flex-col gap-2',
        'animate-stagger',
        className
      )}
    >
      {(list ?? []).map((study) => (
        <StudyCard
          key={study.id}
          study={study}
          view={view}
          selected={selectedIds.has(study.id)}
          onSelectChange={(s) => onSelectChange(study.id, s)}
          onDuplicate={onDuplicate}
          onExport={onExport}
          onShare={onShare}
          onDelete={onDelete}
          onStarToggle={onStarToggle}
          onManageTags={onManageTags}
          onViewAudit={onViewAudit}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          allTags={allTags}
        />
      ))}
    </div>
  )
}
