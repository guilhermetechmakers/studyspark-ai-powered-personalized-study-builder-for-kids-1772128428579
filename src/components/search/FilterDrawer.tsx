/**
 * FilterDrawer - Faceted filters: child, subject, style, date, starred, ownership.
 * Collapsible sections, pill-shaped toggles, clear all, apply/reset.
 */

import { useState, useCallback } from 'react'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { SearchFiltersFacets } from '@/types/search'

export interface FilterDrawerProps {
  facets: {
    children: string[]
    subjects: string[]
    styles: string[]
    dates: string[]
  }
  selectedFacets: Partial<SearchFiltersFacets>
  onApply: (filters: Partial<SearchFiltersFacets>) => void
  onClear: () => void
  counts?: Record<string, number>
  className?: string
}

const DATE_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
]

export function FilterDrawer({
  facets,
  selectedFacets,
  onApply,
  onClear,
  counts = {},
  className,
}: FilterDrawerProps) {
  const [open, setOpen] = useState(false)
  const [localChild, setLocalChild] = useState<string[]>(selectedFacets.child ?? [])
  const [localSubject, setLocalSubject] = useState<string[]>(selectedFacets.subject ?? [])
  const [localStyle, setLocalStyle] = useState<string[]>(selectedFacets.style ?? [])
  const [localDateFrom, setLocalDateFrom] = useState(selectedFacets.dateFrom ?? '')
  const [localStarred, setLocalStarred] = useState(selectedFacets.starred ?? false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    child: true,
    subject: true,
    style: true,
    date: true,
    starred: true,
  })

  const safeChildren = Array.isArray(facets.children) ? facets.children : []
  const safeSubjects = Array.isArray(facets.subjects) ? facets.subjects : []
  const safeStyles = Array.isArray(facets.styles) ? facets.styles : []

  const toggleInArray = useCallback(
    (arr: string[], val: string) =>
      arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val],
    []
  )

  const handleApply = useCallback(() => {
    let dateFrom: string | undefined
    if (localDateFrom) {
      const days = parseInt(localDateFrom, 10)
      if (!isNaN(days)) {
        const d = new Date()
        d.setDate(d.getDate() - days)
        dateFrom = d.toISOString()
      }
    }
    onApply({
      child: localChild.length > 0 ? localChild : undefined,
      subject: localSubject.length > 0 ? localSubject : undefined,
      style: localStyle.length > 0 ? localStyle : undefined,
      dateFrom,
      starred: localStarred || undefined,
    })
    setOpen(false)
  }, [localChild, localSubject, localStyle, localDateFrom, localStarred, onApply])

  const handleClear = useCallback(() => {
    setLocalChild([])
    setLocalSubject([])
    setLocalStyle([])
    setLocalDateFrom('')
    setLocalStarred(false)
    onClear()
  }, [onClear])

  const hasActive = localChild.length > 0 || localSubject.length > 0 || localStyle.length > 0 || !!localDateFrom || localStarred

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('rounded-full', hasActive && 'border-primary bg-primary/5', className)}
          aria-label="Open filters"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasActive && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {localChild.length + localSubject.length + localStyle.length + (localDateFrom ? 1 : 0) + (localStarred ? 1 : 0)}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-full max-w-sm overflow-y-auto sm:max-w-md"
        aria-label="Filter options"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {safeChildren.length > 0 && (
            <FilterSection
              title="Child / Age"
              expanded={expandedSections.child}
              onToggle={() => setExpandedSections((s) => ({ ...s, child: !s.child }))}
            >
              <div className="flex flex-wrap gap-2">
                {safeChildren.map((c) => (
                  <PillToggle
                    key={c}
                    label={c}
                    selected={localChild.includes(c)}
                    count={counts[`child:${c}`]}
                    onClick={() => setLocalChild((prev) => toggleInArray(prev, c))}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {safeSubjects.length > 0 && (
            <FilterSection
              title="Subject"
              expanded={expandedSections.subject}
              onToggle={() => setExpandedSections((s) => ({ ...s, subject: !s.subject }))}
            >
              <div className="flex flex-wrap gap-2">
                {safeSubjects.map((s) => (
                  <PillToggle
                    key={s}
                    label={s}
                    selected={localSubject.includes(s)}
                    count={counts[`subject:${s}`]}
                    onClick={() => setLocalSubject((prev) => toggleInArray(prev, s))}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {safeStyles.length > 0 && (
            <FilterSection
              title="Learning Style"
              expanded={expandedSections.style}
              onToggle={() => setExpandedSections((s) => ({ ...s, style: !s.style }))}
            >
              <div className="flex flex-wrap gap-2">
                {safeStyles.map((s) => (
                  <PillToggle
                    key={s}
                    label={s}
                    selected={localStyle.includes(s)}
                    count={counts[`style:${s}`]}
                    onClick={() => setLocalStyle((prev) => toggleInArray(prev, s))}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          <FilterSection
            title="Date"
            expanded={expandedSections.date}
            onToggle={() => setExpandedSections((s) => ({ ...s, date: !s.date }))}
          >
            <div className="flex flex-wrap gap-2">
              {DATE_OPTIONS.map((d) => (
                <PillToggle
                  key={d.value}
                  label={d.label}
                  selected={localDateFrom === d.value}
                  onClick={() => setLocalDateFrom(localDateFrom === d.value ? '' : d.value)}
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection
            title="Starred"
            expanded={expandedSections.starred}
            onToggle={() => setExpandedSections((s) => ({ ...s, starred: !s.starred }))}
          >
            <PillToggle
              label="Starred only"
              selected={localStarred}
              onClick={() => setLocalStarred((prev) => !prev)}
            />
          </FilterSection>
        </div>

        <div className="mt-8 flex gap-2">
          <Button variant="outline" className="flex-1 rounded-full" onClick={handleClear}>
            <X className="mr-2 h-4 w-4" />
            Clear all
          </Button>
          <Button className="flex-1 rounded-full" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function FilterSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left font-medium"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        {title}
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {expanded && <div className="mt-3">{children}</div>}
    </div>
  )
}

function PillToggle({
  label,
  selected,
  count,
  onClick,
}: {
  label: string
  selected: boolean
  count?: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-2 text-sm font-medium transition-all',
        selected
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'bg-card border border-border text-muted-foreground hover:border-primary/50 hover:bg-primary/5'
      )}
    >
      {label}
      {typeof count === 'number' && count > 0 && (
        <span className="ml-1.5 text-xs opacity-80">({count})</span>
      )}
    </button>
  )
}
