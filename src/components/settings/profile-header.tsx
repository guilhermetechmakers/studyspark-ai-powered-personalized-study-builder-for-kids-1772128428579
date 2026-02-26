import { useState } from 'react'
import { Pencil, Key, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmationModal } from '@/components/settings/confirmation-modal'
import { isValidEmail } from '@/lib/validation'
import type { ParentAccount } from '@/types/settings'

export interface ProfileHeaderProps {
  parent: ParentAccount | null
  onUpdateParent: (payload: { name?: string; email?: string }) => Promise<void>
  onChangePassword: () => void
  onDeleteAccount: () => Promise<void>
  isLoading?: boolean
}

export function ProfileHeader({
  parent,
  onUpdateParent,
  onChangePassword,
  onDeleteAccount,
  isLoading = false,
}: ProfileHeaderProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editName, setEditName] = useState(parent?.name ?? '')
  const [editEmail, setEditEmail] = useState(parent?.email ?? '')
  const [editError, setEditError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const completion = parent?.profileCompletion ?? 0
  const initials = parent?.name
    ? parent.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  const openEdit = () => {
    setEditName(parent?.name ?? '')
    setEditEmail(parent?.email ?? '')
    setEditError(null)
    setEditOpen(true)
  }

  const handleSaveProfile = async () => {
    setEditError(null)
    const name = (editName ?? '').trim()
    const email = (editEmail ?? '').trim()
    if (!name) {
      setEditError('Name is required')
      return
    }
    if (!isValidEmail(email)) {
      setEditError('Please enter a valid email address')
      return
    }
    setSaving(true)
    try {
      await onUpdateParent({ name, email })
      setEditOpen(false)
    } catch {
      setEditError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      await onDeleteAccount()
      setDeleteOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--peach-light))]/40 via-white to-[rgb(var(--lavender))]/10">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-2xl border-2 border-white shadow-card">
                <AvatarImage src={parent?.avatarUrl} alt={parent?.name} />
                <AvatarFallback className="rounded-2xl bg-gradient-to-br from-[rgb(var(--lavender))] to-[rgb(var(--violet))] text-xl font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {parent?.name ?? 'Parent'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {parent?.email ?? '—'}
                </p>
                <div className="mt-2 w-48">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Profile completion</span>
                    <span className="font-medium">{completion}%</span>
                  </div>
                  <Progress value={completion} className="mt-1 h-2" />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openEdit}
                disabled={isLoading}
                className="rounded-full"
              >
                <Pencil className="h-4 w-4" />
                Edit profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onChangePassword}
                disabled={isLoading}
                className="rounded-full"
              >
                <Key className="h-4 w-4" />
                Change password
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteOpen(true)}
                disabled={isLoading}
                className="rounded-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent showCloseButton={!saving} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Update your name and email address.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                disabled={saving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={saving}
              />
            </div>
            {editError && (
              <p className="text-sm text-destructive">{editError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete account"
        description="This will permanently delete your account and all associated data. This action cannot be undone."
        confirmLabel="Delete account"
        variant="destructive"
        onConfirm={handleDeleteAccount}
        isLoading={deleting}
      />
    </>
  )
}
