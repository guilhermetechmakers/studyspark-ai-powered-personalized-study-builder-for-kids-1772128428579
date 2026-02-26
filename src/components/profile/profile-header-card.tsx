/**
 * ProfileHeaderCard - Displays parent name, email, quick edit, audit summary.
 */

import { useState } from 'react'
import { Pencil, Key, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { PrivacyDeleteModal } from '@/components/profile/privacy-delete-modal'
import { isValidEmail } from '@/lib/validation'
import type { UserProfile } from '@/types/profile'

export interface ProfileHeaderCardProps {
  profile: UserProfile | null
  onUpdateProfile: (payload: {
    name?: string
    email?: string
    phone?: string
    address?: string
  }) => Promise<unknown>
  onChangePassword?: () => void
  onDeleteAccount?: () => Promise<void | boolean>
  isLoading?: boolean
}

export function ProfileHeaderCard({
  profile,
  onUpdateProfile,
  onChangePassword,
  onDeleteAccount,
  isLoading = false,
}: ProfileHeaderCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editName, setEditName] = useState(profile?.name ?? '')
  const [editEmail, setEditEmail] = useState(profile?.email ?? '')
  const [editPhone, setEditPhone] = useState(profile?.phone ?? '')
  const [editAddress, setEditAddress] = useState(profile?.address ?? '')
  const [editError, setEditError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  const openEdit = () => {
    setEditName(profile?.name ?? '')
    setEditEmail(profile?.email ?? '')
    setEditPhone(profile?.phone ?? '')
    setEditAddress(profile?.address ?? '')
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
      await onUpdateProfile({ name, email, phone: editPhone || undefined, address: editAddress || undefined })
      setEditOpen(false)
    } catch {
      setEditError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--peach-light))]/40 via-white to-[rgb(var(--lavender))]/10">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-2xl border-2 border-white shadow-card">
                <AvatarImage alt={profile?.name} />
                <AvatarFallback className="rounded-2xl bg-gradient-to-br from-[rgb(var(--lavender))] to-[rgb(var(--violet))] text-xl font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {profile?.name ?? 'Parent'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {profile?.email ?? '—'}
                </p>
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
              {onChangePassword && (
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
              )}
              {onDeleteAccount && (
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
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent showCloseButton={!saving} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Update your name, email, phone, and address.
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
            <div className="grid gap-2">
              <Label htmlFor="profile-phone">Phone</Label>
              <Input
                id="profile-phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="Optional"
                disabled={saving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-address">Address</Label>
              <Input
                id="profile-address"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="Optional"
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

      {onDeleteAccount && (
        <PrivacyDeleteModal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={async () => {
            await onDeleteAccount()
          }}
        />
      )}
    </>
  )
}
