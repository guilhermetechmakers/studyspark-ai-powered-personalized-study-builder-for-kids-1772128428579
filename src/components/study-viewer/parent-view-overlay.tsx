'use client'

import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressChart } from './progress-chart'
import { GamificationPanel } from './gamification-panel'
import { cn } from '@/lib/utils'
import type { ProgressData } from '@/types/study-viewer'

interface ParentViewOverlayProps {
  visible: boolean
  summaryData: ProgressData | null | undefined
  onClose: () => void
  onToggleCollapse?: () => void
  isCollapsed?: boolean
  className?: string
}

export function ParentViewOverlay({
  visible,
  summaryData,
  onClose,
  onToggleCollapse,
  isCollapsed = false,
  className,
}: ParentViewOverlayProps) {
  if (!visible) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-end justify-center sm:items-center',
        'bg-black/40 backdrop-blur-sm',
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Parent view overlay"
    >
      <div
        className={cn(
          'w-full max-w-lg rounded-t-3xl border-t border-border bg-card shadow-2xl transition-all duration-300 sm:rounded-2xl sm:border',
          isCollapsed ? 'max-h-24' : 'max-h-[85vh]'
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-bold text-foreground">Parent View</h2>
          <div className="flex items-center gap-2">
            {onToggleCollapse && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                aria-label={isCollapsed ? 'Expand' : 'Collapse'}
              >
                {isCollapsed ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close parent view"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="overflow-auto p-4 space-y-4">
            <ProgressChart data={summaryData ?? { total: 0, completed: 0, stars: 0, timeSpent: 0, streak: 0, badges: [] }} />
            <GamificationPanel stats={summaryData} />
            <p className="text-sm text-muted-foreground">
              Use this overlay to review your child&apos;s progress. Close to return to the study view.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
