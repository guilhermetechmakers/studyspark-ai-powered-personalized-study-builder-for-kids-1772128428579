/**
 * ChildCard - Displays child name, age, grade, learning preferences (pill badges).
 */

import { useState } from 'react'
import { Pencil, Copy, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ConfirmationModal } from '@/components/settings/confirmation-modal'
import type { ChildProfile } from '@/types/profile'
import { cn } from '@/lib/utils'

export interface ChildCardProps {
  child: ChildProfile
  onEdit: (child: ChildProfile) => void
  onDuplicate?: (child: ChildProfile) => void
  onDelete: (child: ChildProfile) => void | Promise<void>
}

export function ChildCard({ child, onEdit, onDuplicate, onDelete }: ChildCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const initials = child.name ? child.name.charAt(0).toUpperCase() : '?'
  const prefs = Array.isArray(child.learningPreferences) ? child.learningPreferences : []

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true)
    try {
      const result = onDelete(child)
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        await (result as Promise<unknown>)
      }
      setDeleteOpen(false)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <Card
        className={cn(
          'group overflow-hidden border-2 border-border/60 transition-all duration-300',
          'hover:shadow-card-hover hover:-translate-y-0.5',
          'bg-gradient-to-br from-white to-[rgb(var(--peach-light))]/20'
        )}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 rounded-2xl border-2 border-white shadow-md">
                <AvatarImage src={(child as { avatarUrl?: string }).avatarUrl} alt={child.name} />
                <AvatarFallback className="rounded-2xl bg-gradient-to-br from-[rgb(var(--tangerine))] to-[rgb(var(--coral))] text-lg font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-foreground">{child.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Age {child.age} · Grade {child.grade || '—'}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {prefs.map((p) => (
                    <Badge key={p} variant="secondary" className="rounded-full text-xs">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 gap-1 opacity-70 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(child)}
                aria-label={`Edit ${child.name}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              {onDuplicate && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDuplicate(child)}
                  aria-label={`Duplicate ${child.name}`}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteOpen(true)}
                aria-label={`Delete ${child.name}`}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete child profile"
        description={`Are you sure you want to delete ${child.name}'s profile? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteLoading}
      />
    </>
  )
}
