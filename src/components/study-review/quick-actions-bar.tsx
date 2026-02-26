import { Check, Save, Copy, Download, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface QuickActionsBarProps {
  onApprove: () => void
  onSaveDraft: () => void
  onDuplicate: () => void
  onExport: () => void
  onShare: () => void
  isApproving?: boolean
  isSaving?: boolean
  isDuplicating?: boolean
  isExporting?: boolean
  className?: string
}

export function QuickActionsBar({
  onApprove,
  onSaveDraft,
  onDuplicate,
  onExport,
  onShare,
  isApproving = false,
  isSaving = false,
  isDuplicating = false,
  isExporting = false,
  className,
}: QuickActionsBarProps) {
  const isBusy = isApproving || isSaving || isDuplicating || isExporting

  return (
    <nav
      className={cn(
        'fixed bottom-6 left-1/2 z-40 -translate-x-1/2',
        'flex items-center gap-2 rounded-full border-2 border-border bg-card px-4 py-2 shadow-lg',
        'transition-all duration-300 hover:shadow-xl',
        className
      )}
      aria-label="Quick actions"
    >
      <Button
        size="sm"
        onClick={onApprove}
        disabled={isBusy}
        className="rounded-full"
        aria-label="Approve study"
      >
        <Check className="mr-2 h-4 w-4" />
        {isApproving ? 'Approving...' : 'Approve'}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={onSaveDraft}
        disabled={isBusy}
        className="rounded-full"
        aria-label="Save draft"
      >
        <Save className="mr-2 h-4 w-4" />
        {isSaving ? 'Saving...' : 'Save Draft'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDuplicate}
        disabled={isBusy}
        className="rounded-full"
        aria-label="Duplicate study"
      >
        <Copy className="mr-2 h-4 w-4" />
        {isDuplicating ? 'Duplicating...' : 'Duplicate'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onExport}
        disabled={isBusy}
        className="rounded-full"
        aria-label="Export study"
      >
        <Download className="mr-2 h-4 w-4" />
        {isExporting ? 'Exporting...' : 'Export'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onShare}
        disabled={isBusy}
        className="rounded-full"
        aria-label="Share study"
      >
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </Button>
    </nav>
  )
}
