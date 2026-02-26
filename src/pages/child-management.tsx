/**
 * Child Management Page (page_p012) - Full child profile management.
 */

import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ChildManagementPanel } from '@/components/profile'
import { useProfileData } from '@/hooks/use-profile-data'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

export function ChildManagementPage() {
  const {
    children,
    isLoading,
    addChild,
    updateChild,
    removeChild,
  } = useProfileData()

  if (isLoading) {
    return (
      <main className="container mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </main>
    )
  }

  return (
    <main
      className="container mx-auto max-w-4xl space-y-6 p-4 animate-fade-in sm:p-6"
      aria-labelledby="children-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard/profile" aria-label="Back to profile">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl" id="children-heading">
              Child profiles
            </h1>
            <p className="mt-1 text-muted-foreground">
              Add and manage your children&apos;s learning profiles
            </p>
          </div>
        </div>
      </div>

      <ChildManagementPanel
        children={children ?? []}
        onAddChild={addChild}
        onUpdateChild={updateChild}
        onDeleteChild={removeChild}
      />
    </main>
  )
}
