/**
 * ChildManagementPanel - List of ChildCard with add/edit/delete.
 */

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ChildCard } from '@/components/profile/child-card'
import { ChildProfileForm } from '@/components/profile/child-profile-form'
import type { ChildProfile, ChildProfileInput } from '@/types/profile'
import { cn } from '@/lib/utils'

export interface ChildManagementPanelProps {
  children: ChildProfile[]
  onAddChild: (payload: ChildProfileInput) => Promise<ChildProfile | null>
  onUpdateChild: (id: string, payload: Partial<ChildProfileInput>) => Promise<ChildProfile | null>
  onDeleteChild: (id: string) => Promise<boolean>
}

export function ChildManagementPanel({
  children,
  onAddChild,
  onUpdateChild,
  onDeleteChild,
}: ChildManagementPanelProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null)
  const [saving, setSaving] = useState(false)

  const safeChildren = Array.isArray(children) ? children : []

  const handleAddSubmit = async (values: ChildProfileInput) => {
    setSaving(true)
    try {
      const created = await onAddChild(values)
      if (created) setAddOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (child: ChildProfile) => {
    setEditingChild(child)
    setEditOpen(true)
  }

  const handleEditSubmit = async (values: ChildProfileInput) => {
    if (!editingChild) return
    setSaving(true)
    try {
      const updated = await onUpdateChild(editingChild.id, values)
      if (updated) {
        setEditOpen(false)
        setEditingChild(null)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDuplicate = async (child: ChildProfile) => {
    const payload: ChildProfileInput = {
      name: `${child.name} (copy)`,
      age: child.age,
      grade: child.grade,
      learningPreferences: child.learningPreferences ?? [],
    }
    setSaving(true)
    try {
      await onAddChild(payload)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (child: ChildProfile) => {
    await onDeleteChild(child.id)
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
          <Button onClick={() => setAddOpen(true)} className="rounded-full">
            <UserPlus className="h-4 w-4" />
            Add child
          </Button>
        </CardHeader>
        <CardContent>
          {safeChildren.length === 0 ? (
            <div
              className={cn(
                'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 py-12'
              )}
            >
              <UserPlus className="mb-3 h-12 w-12 text-muted-foreground" />
              <p className="mb-1 font-medium text-foreground">No child profiles yet</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Add your first child to get started with personalized learning.
              </p>
              <Button onClick={() => setAddOpen(true)} className="rounded-full">
                Add child
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {safeChildren.map((child) => (
                <ChildCard
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

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent showCloseButton={!saving} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add child profile</DialogTitle>
            <DialogDescription>
              Create a new profile for your child. You can customize learning preferences later.
            </DialogDescription>
          </DialogHeader>
          <ChildProfileForm
            onSubmit={handleAddSubmit}
            onCancel={() => setAddOpen(false)}
            isLoading={saving}
            submitLabel="Add child"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={(open) => !open && setEditingChild(null)}>
        <DialogContent showCloseButton={!saving} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit child profile</DialogTitle>
            <DialogDescription>
              Update your child&apos;s information and learning preferences.
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
