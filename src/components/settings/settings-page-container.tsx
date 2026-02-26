import { Link } from 'react-router-dom'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  NotificationsPanel,
  IntegrationsPanel,
  BillingPanel,
  PrivacyPanel,
  AccountSecurityPanel,
  SettingsSkeleton,
} from '@/components/settings'
import {
  ProfileHeaderCard,
  ChildManagementPanel,
  ExportButton,
} from '@/components/profile'
import { useSettingsData } from '@/hooks/use-settings-data'
import { useProfileData } from '@/hooks/use-profile-data'

export function SettingsPageContainer() {
  const {
    parent,
    notifications,
    integrations,
    billing,
    invoices,
    privacy,
    exportRequests,
    isLoading,
    updateNotifications,
    connectIntegration,
    disconnectIntegration,
    setBilling,
    setPrivacy,
    changePassword,
    deleteAccount,
    refetch,
  } = useSettingsData()

  const {
    userProfile,
    children,
    isLoading: profileLoading,
    updateProfile,
    addChild,
    updateChild,
    removeChild,
    exportJson,
    exportCsv,
    requestPrivacyDeletion,
  } = useProfileData()

  const profileForHeader = userProfile ?? (parent ? {
    id: parent.id,
    name: parent.name,
    email: parent.email,
    createdAt: '',
    updatedAt: '',
  } : null)

  const handleChangePassword = () => {
    changePassword()
  }

  const handleDeleteAccount = async () => {
    await requestPrivacyDeletion()
    if (!userProfile) await deleteAccount()
  }

  if (isLoading && profileLoading) {
    return <SettingsSkeleton />
  }

  return (
    <main
      className="container mx-auto max-w-4xl space-y-6 p-4 animate-fade-in sm:p-6"
      aria-labelledby="settings-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl" id="settings-heading">
            Settings & preferences
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account, children, notifications, and more
          </p>
        </div>
        <ExportButton
          onExportJson={exportJson}
          onExportCsv={exportCsv}
          disabled={profileLoading}
        />
      </div>

      <ProfileHeaderCard
        profile={profileForHeader}
        onUpdateProfile={updateProfile}
        onChangePassword={handleChangePassword}
        onDeleteAccount={handleDeleteAccount}
        isLoading={profileLoading}
      />

      <Accordion type="multiple" defaultValue={['account', 'children', 'notifications', 'integrations', 'billing', 'privacy']} className="space-y-4">
        <AccordionItem value="account" className="rounded-2xl border-2 border-border/60 bg-card">
          <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]]:border-b [&[data-state=open]]:border-border/60">
            <span className="text-lg font-semibold">Account & security</span>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <AccountSecurityPanel />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="children" className="rounded-2xl border-2 border-border/60 bg-card">
          <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]]:border-b [&[data-state=open]]:border-border/60">
            <span className="text-lg font-semibold">Child profiles</span>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <ChildManagementPanel
              children={children ?? []}
              onAddChild={addChild}
              onUpdateChild={updateChild}
              onDeleteChild={removeChild}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="notifications" className="rounded-2xl border-2 border-border/60 bg-card">
          <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]]:border-b [&[data-state=open]]:border-border/60">
            <span className="text-lg font-semibold">Notifications</span>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <NotificationsPanel
              settings={notifications}
              onSettingsChange={updateNotifications}
            />
            <p className="mt-4 text-sm text-muted-foreground">
              <Link
                to="/dashboard/notifications/preferences"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Manage notification preferences
              </Link>
              {' '}for granular control over email, push, and unsubscribe settings.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="integrations" className="rounded-2xl border-2 border-border/60 bg-card">
          <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]]:border-b [&[data-state=open]]:border-border/60">
            <span className="text-lg font-semibold">Integrations</span>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <IntegrationsPanel
              integrations={integrations}
              onConnect={connectIntegration}
              onDisconnect={disconnectIntegration}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="billing" className="rounded-2xl border-2 border-border/60 bg-card">
          <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]]:border-b [&[data-state=open]]:border-border/60">
            <span className="text-lg font-semibold">Billing & subscription</span>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <BillingPanel
              billing={billing}
              invoices={invoices}
              onBillingChange={setBilling}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="privacy" className="rounded-2xl border-2 border-border/60 bg-card">
          <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]]:border-b [&[data-state=open]]:border-border/60">
            <span className="text-lg font-semibold">Privacy controls</span>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <PrivacyPanel
              privacy={privacy}
              exportRequests={exportRequests ?? []}
              onPrivacyChange={setPrivacy}
              onExportRequested={refetch}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </main>
  )
}
