/**
 * Profile Dashboard (page_p005) - Profile header, audit summary, export, quick actions.
 */

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Settings, FileText } from 'lucide-react'
import {
  ProfileHeaderCard,
  AuditTrailPanel,
  ExportButton,
} from '@/components/profile'
import { useProfileData } from '@/hooks/use-profile-data'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

export function ProfileDashboardPage() {
  const {
    userProfile,
    children,
    auditLog,
    isLoading,
    loadAudit,
    updateProfile,
    exportJson,
    exportCsv,
    requestPrivacyDeletion,
  } = useProfileData()

  useEffect(() => {
    loadAudit()
  }, [loadAudit])

  const handleChangePassword = () => {
    window.location.href = '/forgot-password'
  }

  if (isLoading) {
    return (
      <main className="container mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </main>
    )
  }

  return (
    <main
      className="container mx-auto max-w-4xl space-y-6 p-4 animate-fade-in sm:p-6"
      aria-labelledby="profile-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl" id="profile-heading">
            Profile
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account and view activity
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportButton
            onExportJson={exportJson}
            onExportCsv={exportCsv}
            disabled={isLoading}
          />
          <Button variant="outline" size="sm" asChild className="rounded-full">
            <Link to="/dashboard/children">
              <Users className="h-4 w-4" />
              Manage children ({children?.length ?? 0})
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="rounded-full">
            <Link to="/dashboard/settings">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <ProfileHeaderCard
        profile={userProfile}
        onUpdateProfile={updateProfile}
        onChangePassword={handleChangePassword}
        onDeleteAccount={async () => { await requestPrivacyDeletion() }}
        isLoading={isLoading}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AuditTrailPanel
          auditLog={auditLog ?? []}
          isLoading={false}
          onLoad={loadAudit}
        />
        <div className="rounded-2xl border-2 border-border/60 bg-card p-6">
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
            <FileText className="h-5 w-5" />
            Quick actions
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Export your data or manage your children.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild className="rounded-full">
              <Link to="/dashboard/children">Add child</Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="rounded-full">
              <Link to="/dashboard/settings">Privacy & export</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
