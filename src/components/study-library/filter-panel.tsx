/**
 * FilterPanel - Compact collapsible filters for Study Library.
 * Child, Subject, Learning Style, Date Range, Starred, Tags.
 * Dense layout with accordion; preserves filter semantics.
 */

import { Filter, Tag, X, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import type { StudyLibraryFilters } from '@/types/study-library'

export interface FilterPanelProps {
  filters: StudyLibraryFilters
  onChange: (filters: StudyLibraryFilters) => void
  children: { id: string; name: string }[]
  subjects: { id: string; name: string }[]
  learningStyles: { id: string; name: string }[]
  tags?: { id: string; name: string; color?: string }[]
  className?: string
}

export function FilterPanel({
  filters,
  onChange,
  children,
  subjects,
  learningStyles,
  tags = [],
  className,
}: FilterPanelProps) {
  const [expanded, setExpanded] = useState<string | false>('filters')

  const hasActiveFilters =
    !!filters.childId ||
    !!filters.subjectId ||
    !!filters.learningStyleId ||
    (filters.tagIds?.length ?? 0) > 0 ||
    !!filters.startDate ||
    !!filters.endDate ||
    filters.starred === true

  const clearAll = () => {
    onChange({
      ...filters,
      childId: undefined,
      subjectId: undefined,
      learningStyleId: undefined,
      tagIds: undefined,
      startDate: undefined,
      endDate: undefined,
      starred: undefined,
    })
  }

  const toggleTag = (tagId: string) => {
    const current = filters.tagIds ?? []
    const next = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId]
    onChange({ ...filters, tagIds: next.length > 0 ? next : undefined })
  }

  const childList = children ?? []
  const subjectList = subjects ?? []
  const styleList = learningStyles ?? []
  const tagList = tags ?? []

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card',
        className
      )}
      role="group"
      aria-label="Filter studies"
    >
      <Accordion
        type="single"
        collapsible
        value={expanded ? 'filters' : ''}
        onValueChange={(v) => setExpanded(v === 'filters' ? 'filters' : false)}
      >
        <AccordionItem value="filters" className="border-0">
          <AccordionTrigger
            className="px-3 py-2 text-sm font-medium hover:no-underline [&[data-state=open]>svg]:rotate-180"
            aria-label={expanded ? 'Collapse filters' : 'Expand filters'}
          >
            <span className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              Filters
              {hasActiveFilters && (
                <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-xs">
                  Active
                </span>
              )}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3 pt-0">
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {childList.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="filter-child" className="text-xs text-muted-foreground">
                      Child
                    </Label>
                    <Select
                      value={filters.childId ?? 'all'}
                      onValueChange={(v) =>
                        onChange({ ...filters, childId: v === 'all' ? undefined : v })
                      }
                    >
                      <SelectTrigger
                        id="filter-child"
                        className="h-8 text-xs"
                        aria-label="Filter by child"
                      >
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All children</SelectItem>
                        {childList.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {subjectList.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="filter-subject" className="text-xs text-muted-foreground">
                      Subject
                    </Label>
                    <Select
                      value={filters.subjectId ?? 'all'}
                      onValueChange={(v) =>
                        onChange({ ...filters, subjectId: v === 'all' ? undefined : v })
                      }
                    >
                      <SelectTrigger
                        id="filter-subject"
                        className="h-8 text-xs"
                        aria-label="Filter by subject"
                      >
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All subjects</SelectItem>
                        {subjectList.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {styleList.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="filter-style" className="text-xs text-muted-foreground">
                      Learning Style
                    </Label>
                    <Select
                      value={filters.learningStyleId ?? 'all'}
                      onValueChange={(v) =>
                        onChange({
                          ...filters,
                          learningStyleId: v === 'all' ? undefined : v,
                        })
                      }
                    >
                      <SelectTrigger
                        id="filter-style"
                        className="h-8 text-xs"
                        aria-label="Filter by learning style"
                      >
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All styles</SelectItem>
                        {styleList.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <Label htmlFor="filter-start" className="text-xs text-muted-foreground">
                    From
                  </Label>
                  <Input
                    id="filter-start"
                    type="date"
                    value={filters.startDate ?? ''}
                    onChange={(e) =>
                      onChange({ ...filters, startDate: e.target.value || undefined })
                    }
                    className="h-8 text-xs"
                    aria-label="Filter from date"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="filter-end" className="text-xs text-muted-foreground">
                    To
                  </Label>
                  <Input
                    id="filter-end"
                    type="date"
                    value={filters.endDate ?? ''}
                    onChange={(e) =>
                      onChange({ ...filters, endDate: e.target.value || undefined })
                    }
                    className="h-8 text-xs"
                    aria-label="Filter to date"
                  />
                </div>
              </div>

              {tagList.length > 0 && (
                <div className="flex flex-col gap-1">
                  <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    Tags
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {tagList.map((t) => {
                      const isActive = (filters.tagIds ?? []).includes(t.id)
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleTag(t.id)}
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium transition-all duration-200',
                            'hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            isActive
                              ? 'ring-2 ring-primary/50 shadow-sm'
                              : 'bg-muted/80 hover:bg-muted'
                          )}
                          style={
                            isActive && t.color
                              ? { backgroundColor: `${t.color}30`, borderColor: t.color }
                              : undefined
                          }
                          aria-pressed={isActive}
                          aria-label={`Filter by tag ${t.name}`}
                        >
                          {t.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id="filter-starred"
                    checked={filters.starred ?? false}
                    onCheckedChange={(v) =>
                      onChange({ ...filters, starred: v ? true : undefined })
                    }
                    aria-label="Show starred only"
                  />
                  <Label htmlFor="filter-starred" className="text-xs font-medium">
                    Starred only
                  </Label>
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="h-7 gap-1 px-2 text-xs"
                    aria-label="Clear all filters"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear filters
                  </Button>
                )}
              </div>

              {hasActiveFilters && (
                <p className="text-xs text-muted-foreground">
                  Tip: Click &quot;Clear filters&quot; to reset all filters.
                </p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
