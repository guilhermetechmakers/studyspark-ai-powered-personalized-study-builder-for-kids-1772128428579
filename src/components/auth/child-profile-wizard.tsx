import { useState } from 'react'
import { Loader2, Plus, Trash2, User, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LEARNING_PREFERENCES,
  GRADE_LEVELS,
  type ChildProfile,
  type LearningPreference,
} from '@/types/auth'
import { dataGuard } from '@/lib/data-guard'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/settings/empty-state'
import { toast } from 'sonner'

const EMPTY_PROFILE: Omit<ChildProfile, 'id' | 'userId' | 'createdAt'> = {
  name: '',
  age: 8,
  grade: '',
  learningPreferences: [],
}

export interface ChildProfileWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (profiles: ChildProfile[]) => Promise<void>
  onSkip?: () => void
  userId: string
}

export function ChildProfileWizard({
  open,
  onOpenChange,
  onComplete,
  onSkip,
  userId,
}: ChildProfileWizardProps) {
  const [profiles, setProfiles] = useState<Partial<ChildProfile>[]>([
    { ...EMPTY_PROFILE, userId },
  ])
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<number, string>>({})

  const safeProfiles = dataGuard(profiles)

  const addProfile = () => {
    setProfiles((prev) => [...(prev ?? []), { ...EMPTY_PROFILE, userId }])
    setErrors((e) => {
      const next = { ...e }
      delete next[safeProfiles.length]
      return next
    })
  }

  const removeProfile = (index: number) => {
    setProfiles((prev) => (prev ?? []).filter((_, i) => i !== index))
    setErrors((e) => {
      const next = { ...e }
      delete next[index]
      return next
    })
  }

  const updateProfile = (index: number, updates: Partial<ChildProfile>) => {
    setProfiles((prev) => {
      const list = prev ?? []
      const next = [...list]
      next[index] = { ...next[index], ...updates }
      return next
    })
  }

  const togglePreference = (index: number, pref: LearningPreference) => {
    const p = safeProfiles[index]
    const prefs = (p?.learningPreferences ?? []) as string[]
    const next = prefs.includes(pref)
      ? prefs.filter((x) => x !== pref)
      : [...prefs, pref]
    updateProfile(index, { learningPreferences: next })
  }

  const validate = (): boolean => {
    const nextErrors: Record<number, string> = {}
    if (safeProfiles.length === 0) {
      setErrors({ 0: 'Add at least one child profile to continue' })
      return false
    }
    safeProfiles.forEach((p, i) => {
      if (!p?.name?.trim()) nextErrors[i] = 'Name is required'
      else if ((p.age ?? 0) < 2 || (p.age ?? 0) > 18) nextErrors[i] = 'Age must be between 2 and 18'
      else if (!p?.grade?.trim()) nextErrors[i] = 'Grade is required'
      else if (!Array.isArray(p?.learningPreferences) || (p.learningPreferences?.length ?? 0) < 1)
        nextErrors[i] = 'Select at least one learning preference'
    })
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setIsSaving(true)
    try {
      const toSave: ChildProfile[] = safeProfiles.map((p, i) => ({
        id: p?.id ?? `temp-${i}`,
        userId: p?.userId ?? userId,
        name: (p?.name ?? '').trim(),
        age: p?.age ?? 8,
        grade: (p?.grade ?? '').trim(),
        learningPreferences: Array.isArray(p?.learningPreferences) ? p.learningPreferences : [],
      }))
      await onComplete(toSave)
      toast.success('Profiles saved!')
      onOpenChange(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save profiles'
      toast.error(msg)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add your child profiles</DialogTitle>
          <DialogDescription>
            Create at least one profile so we can personalize study materials. You can add more later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {safeProfiles.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No child profiles yet"
              description="Add your first child profile to personalize study materials and track progress."
              actionLabel="Add your first child"
              onAction={addProfile}
            />
          ) : (
            <>
          {(safeProfiles ?? []).map((profile, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-muted/30 p-4 space-y-4 animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  Child {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProfile(index)}
                  aria-label={`Remove child ${index + 1}`}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`child-name-${index}`}>Name</Label>
                  <Input
                    id={`child-name-${index}`}
                    placeholder="Child's name"
                    value={profile?.name ?? ''}
                    onChange={(e) => updateProfile(index, { name: e.target.value })}
                    aria-invalid={Boolean(errors[index])}
                    aria-label={`Child ${index + 1} name`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`child-age-${index}`}>Age</Label>
                  <Input
                    id={`child-age-${index}`}
                    type="number"
                    min={2}
                    max={18}
                    placeholder="8"
                    value={profile?.age ?? ''}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10)
                      if (!isNaN(v)) updateProfile(index, { age: v })
                    }}
                    aria-label={`Child ${index + 1} age (2 to 18)`}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`child-grade-${index}`}>Grade level</Label>
                <Select
                  value={profile?.grade ?? ''}
                  onValueChange={(v) => updateProfile(index, { grade: v })}
                >
                  <SelectTrigger id={`child-grade-${index}`} aria-label={`Child ${index + 1} grade level`}>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(GRADE_LEVELS ?? []).map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label id={`child-preferences-${index}`}>Learning preferences</Label>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-labelledby={`child-preferences-${index}`}
                >
                  {LEARNING_PREFERENCES.map((pref) => {
                    const { id, label } = pref
                    const selected = (profile?.learningPreferences ?? []).includes(id)
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => togglePreference(index, id)}
                        aria-pressed={selected}
                        aria-label={`${label}${selected ? ', selected' : ''}`}
                        className={cn(
                          'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                          selected
                            ? 'bg-primary text-primary-foreground shadow-card'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        )}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
              {errors[index] !== undefined && (
                <p className="text-sm text-destructive" role="alert">
                  {errors[index]}
                </p>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={addProfile}
            aria-label="Add another child profile"
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            Add another child
          </Button>
            </>
          )}
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onOpenChange(false)
              onSkip?.()
            }}
            disabled={isSaving}
            className="sm:mr-auto"
          >
            Skip for now
          </Button>
          <Button onClick={handleSave} disabled={isSaving} aria-busy={isSaving} aria-label={isSaving ? 'Saving profiles' : 'Save and continue'}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Saving...
              </>
            ) : (
              'Save & continue'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
