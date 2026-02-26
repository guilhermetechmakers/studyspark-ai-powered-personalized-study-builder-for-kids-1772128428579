import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ChildProfileForm, type ChildProfileFormValues } from '@/components/settings/child-profile-form'

export interface AddChildProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ChildProfileFormValues) => void | Promise<void>
  isLoading?: boolean
}

export function AddChildProfileModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: AddChildProfileModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!isLoading} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add child profile</DialogTitle>
          <DialogDescription>
            Create a new profile for your child. You can customize learning style and preferences later.
          </DialogDescription>
        </DialogHeader>
        <ChildProfileForm
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
          submitLabel="Add child"
        />
      </DialogContent>
    </Dialog>
  )
}
