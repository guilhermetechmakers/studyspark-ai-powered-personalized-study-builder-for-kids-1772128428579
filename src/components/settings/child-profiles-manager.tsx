import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChildProfileCard } from '@/components/settings/child-profile-card'
import { AddChildProfileModal } from '@/components/settings/add-child-profile-modal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ChildProfileForm, type ChildProfileFormValues } from '@/components/settings/child-profile-form'
import { EmptyState } from '@/components/settings/empty-state'
import { toast } from 'sonner'
import type { ChildProfile } from '@/types/settings'
import {
  createChildProfile,
  updateChildProfile,
  deleteChildProfile,
} from '@/api/settings'

export interface ChildProfilesManagerProps {
  profiles: ChildProfile[]
  onProfilesChange: (profiles: ChildProfile[]) => void
}

export function ChildProfilesManager({ profiles, onProfilesChange }: ChildProfilesManagerProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null)
  const [saving, setSaving] = useState(false)

  const safeProfiles = Array.isArray(profiles) ? profiles : []

  const handleAddSubmit = async (values: ChildProfileFormValues) => {
    setSaving(true)
    try {
      const created = await createChildProfile(values)
      if (created) {
        onProfilesChange([...safeProfiles, created])
        setAddOpen(false)
        toast.success('Child profile added')
      } else {
        toast.error('Failed to add child profile')
      }
    } catch {
      toast.error('Failed to add child profile')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (child: ChildProfile) => {
    setEditingChild(child)
    setEditOpen(true)
  }

  const handleEditSubmit = async (values: ChildProfileFormValues) => {
    if (!editingChild) return
    setSaving(true)
    try {
      const updated = await updateChildProfile(editingChild.id, values)
      if (updated) {
        onProfilesChange(
          safeProfiles.map((p) => (p.id === editingChild.id ? updated : p))
        )
        setEditOpen(false)
        setEditingChild(null)
        toast.success('Child profile updated')
      } else {
        toast.error('Failed to update child profile')
      }
    } catch {
      toast.error('Failed to update child profile')
    } finally {
      setSaving(false)
    }
  }

  const handleDuplicate = async (child: ChildProfile) => {
    const duplicate: ChildProfileFormValues = {
      name: `${child.name} (copy)`,
      age: child.age,
      grade: child.grade,
      learningStyle: child.learningStyle,
    }
    setSaving(true)
    try {
      const created = await createChildProfile(duplicate)
      if (created) {
        onProfilesChange([...safeProfiles, created])
        toast.success('Child profile duplicated')
      } else {
        toast.error('Failed to duplicate child profile')
      }
    } catch {
      toast.error('Failed to duplicate child profile')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (child: ChildProfile) => {
    const ok = await deleteChildProfile(child.id)
    if (ok) {
      onProfilesChange(safeProfiles.filter((p) => p.id !== child.id))
      toast.success('Child profile deleted')
    } else {
      toast.error('Failed to delete child profile')
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Child profiles</CardTitle>
            <CardDescription>
              Manage your children&apos;s profiles and learning preferences
            </CardDescription>
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            className="rounded-full"
          >
            <UserPlus className="h-4 w-4" />
            Add child
          </Button>
        </CardHeader>
        <CardContent>
          {safeProfiles.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="No child profiles yet"
              description="Add your first child to get started with personalized learning."
              actionLabel="Add child"
              onAction={() => setAddOpen(true)}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {safeProfiles.map((child) => (
                <ChildProfileCard
                  key={child.id}
                  child={child}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddChildProfileModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAddSubmit}
        isLoading={saving}
      />

      <Dialog open={editOpen} onOpenChange={(open) => !open && setEditingChild(null)}>
        <DialogContent showCloseButton={!saving} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit child profile</DialogTitle>
            <DialogDescription>
              Update your child&apos;s information and learning style.
            </DialogDescription>
          </DialogHeader>
          {editingChild && (
            <ChildProfileForm
              defaultValues={editingChild}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditOpen(false)}
              isLoading={saving}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
