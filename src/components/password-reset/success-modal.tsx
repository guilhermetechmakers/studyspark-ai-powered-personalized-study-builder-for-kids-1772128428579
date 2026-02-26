import { CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export interface SuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose?: () => void
}

const SUPPORT_EMAIL = 'support@studyspark.com'

export function SuccessModal({ open, onOpenChange, onClose }: SuccessModalProps) {
  const handleClose = () => {
    onOpenChange(false)
    onClose?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={true}
        onPointerDownOutside={handleClose}
        onEscapeKeyDown={handleClose}
      >
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <DialogTitle className="text-center">Check your email</DialogTitle>
          <DialogDescription className="text-center space-y-3 pt-2">
            <p>
              If an account exists with that email, we&apos;ve sent a password reset link. Please
              check your inbox and spam folder.
            </p>
            <p className="text-sm">
              The link expires in 1 hour. If you don&apos;t receive it, you can request a new one.
            </p>
            <p className="text-sm">
              Need help? Contact us at{' '}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-2">
          <Button asChild className="w-full">
            <Link to="/login">Back to login</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link to="/password-reset" onClick={handleClose}>
              Request another link
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
