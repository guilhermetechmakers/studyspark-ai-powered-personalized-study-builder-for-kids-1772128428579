import { CheckCircle, FileDown, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ApprovalBarProps {
  onApprove: () => void
  onExport?: () => void
  onShare?: () => void
  isApproving?: boolean
  isExporting?: boolean
  isSharing?: boolean
  status?: 'draft' | 'approved'
  className?: string
}

export function ApprovalBar({
  onApprove,
  onExport,
  onShare,
  isApproving = false,
  isExporting = false,
  isSharing = false,
  status = 'draft',
  className,
}: ApprovalBarProps) {
  const isApproved = status === 'approved'

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-2xl border-2 border-border bg-gradient-to-r from-[rgb(var(--peach-light))]/20 to-white p-4',
        className
      )}
    >
      <Button
        onClick={onApprove}
        disabled={isApproving || isApproved}
        className="rounded-full bg-primary px-6 shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
        aria-label="Approve study"
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        {isApproving ? 'Approving...' : isApproved ? 'Approved' : 'Approve study'}
      </Button>
      {onExport && (
        <Button
          variant="outline"
          onClick={onExport}
          disabled={isExporting}
          className="rounded-full"
          aria-label="Export study"
        >
          <FileDown className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      )}
      {onShare && (
        <Button
          variant="outline"
          onClick={onShare}
          disabled={isSharing}
          className="rounded-full"
          aria-label="Share study"
        >
          <Share2 className="mr-2 h-4 w-4" />
          {isSharing ? 'Sharing...' : 'Share'}
        </Button>
      )}
    </div>
  )
}
