import { CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SuccessModalAction {
  label: string
  onClick: () => void
}

export interface SuccessModalProps {
  /** Whether the modal is open */
  open: boolean
  /** Modal title */
  title: string
  /** Descriptive text below the title */
  description?: string
  /** Primary action (e.g. "View Results", "Download") */
  primaryAction: SuccessModalAction
  /** Optional secondary action (e.g. "Close") */
  secondaryAction?: SuccessModalAction
  /** Called when modal should close (overlay click, escape, or secondary action) */
  onClose: () => void
  /** Additional class names for the content */
  className?: string
  /** Whether to show the close button in the header */
  showCloseButton?: boolean
}

export function SuccessModal({
  open,
  title,
  description = '',
  primaryAction,
  secondaryAction,
  onClose,
  className,
  showCloseButton = true,
}: SuccessModalProps) {
  const handlePrimaryClick = () => {
    primaryAction.onClick()
    onClose()
  }

  const handleSecondaryClick = () => {
    secondaryAction?.onClick?.()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={showCloseButton}
        className={cn('sm:max-w-md', className)}
        aria-modal="true"
        aria-labelledby="success-modal-title"
        aria-describedby="success-modal-description"
      >
        <DialogHeader>
          <div className="flex flex-col items-center gap-4 text-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-success/30 to-success/10 text-success"
              aria-hidden="true"
            >
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <DialogTitle
                id="success-modal-title"
                className="text-xl font-bold text-foreground"
              >
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription
                  id="success-modal-description"
                  className="text-muted-foreground"
                >
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={handleSecondaryClick}
              className="rounded-full"
            >
              {secondaryAction.label}
            </Button>
          )}
          <Button
            onClick={handlePrimaryClick}
            className="rounded-full shadow-md hover:scale-[1.02] hover:shadow-lg"
          >
            {primaryAction.label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
