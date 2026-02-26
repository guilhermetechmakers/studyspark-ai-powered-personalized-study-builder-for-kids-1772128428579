import { useState } from 'react'
import { Download, Trash2, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ConfirmationModal } from '@/components/settings/confirmation-modal'
import { toast } from 'sonner'
import type { PrivacySettings, DataExportRequest } from '@/types/settings'
import {
  requestDataExport,
  requestDataDeletion,
  updatePrivacyConsents,
} from '@/api/settings'

export interface PrivacyPanelProps {
  privacy: PrivacySettings
  exportRequests?: DataExportRequest[]
  onPrivacyChange: (privacy: PrivacySettings) => void
  onExportRequested?: () => void
}

function formatExportStatus(status: DataExportRequest['status']): string {
  const labels: Record<DataExportRequest['status'], string> = {
    pending: 'Pending',
    processing: 'Processing',
    ready: 'Ready for download',
    expired: 'Expired',
  }
  return labels[status] ?? status
}

export function PrivacyPanel({ privacy, exportRequests = [], onPrivacyChange, onExportRequested }: PrivacyPanelProps) {
  const [exportLoading, setExportLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [consentSaving, setConsentSaving] = useState(false)

  const consents = privacy.consents ?? {
    analytics: true,
    marketing: false,
    personalization: true,
  }

  const handleDataExport = async () => {
    setExportLoading(true)
    try {
      const result = await requestDataExport()
      if (result) {
        onExportRequested?.()
        toast.success('Data export requested. You will receive an email when ready.')
      } else {
        toast.error('Failed to request data export')
      }
    } catch {
      toast.error('Failed to request data export')
    } finally {
      setExportLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true)
    try {
      const ok = await requestDataDeletion()
      if (ok) {
        onPrivacyChange({
          ...privacy,
          deletionConsent: true,
          deletionRequestedAt: new Date().toISOString(),
          deletionStatus: 'pending',
        } as PrivacySettings & { deletionRequestedAt?: string; deletionStatus?: string })
        setDeleteOpen(false)
        toast.success('Account deletion requested. You will receive a confirmation email.')
      } else {
        toast.error('Failed to request deletion')
      }
    } catch {
      toast.error('Failed to request deletion')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleConsentChange = async (key: string, value: boolean) => {
    const next = { ...consents, [key]: value }
    setConsentSaving(true)
    try {
      const updated = await updatePrivacyConsents({ consents: next })
      if (updated) {
        onPrivacyChange({
          ...privacy,
          consents: updated.consents ?? next,
        })
        toast.success('Consent preferences updated')
      } else {
        toast.error('Failed to update')
      }
    } catch {
      toast.error('Failed to update')
    } finally {
      setConsentSaving(false)
    }
  }

  const consentLabels: Record<string, string> = {
    analytics: 'Analytics & usage',
    marketing: 'Marketing emails',
    personalization: 'Personalization',
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Privacy controls</CardTitle>
          <CardDescription>
            Data export, account deletion, and consent management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-2xl border border-border p-4">
            <h4 className="mb-2 flex items-center gap-2 font-medium">
              <Download className="h-4 w-4" />
              Data export
            </h4>
            <p className="mb-3 text-sm text-muted-foreground">
              Request a copy of your data. You will receive an email with a download link when ready (typically within 48 hours).
            </p>
            {(exportRequests ?? []).length > 0 && (
              <div className="mb-3 space-y-2">
                {(exportRequests ?? []).map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2"
                  >
                    <span className="text-sm text-muted-foreground">
                      Requested {new Date(req.requestedAt).toLocaleDateString()}
                      {req.expectedReadyAt && (
                        <> · Expected: {new Date(req.expectedReadyAt).toLocaleDateString()}</>
                      )}
                    </span>
                    <Badge
                      variant={
                        req.status === 'ready'
                          ? 'success'
                          : req.status === 'expired'
                            ? 'secondary'
                            : 'default'
                      }
                    >
                      {formatExportStatus(req.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDataExport}
              disabled={exportLoading}
              className="rounded-full"
            >
              {exportLoading ? 'Requesting…' : 'Request data export'}
            </Button>
          </div>

          <div className="rounded-2xl border border-border p-4">
            <h4 className="mb-2 flex items-center gap-2 font-medium text-destructive">
              <Trash2 className="h-4 w-4" />
              Delete account
            </h4>
            <p className="mb-3 text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="rounded-full"
            >
              Request account deletion
            </Button>
          </div>

          <div className="rounded-2xl border border-border p-4">
            <h4 className="mb-3 flex items-center gap-2 font-medium">
              <Shield className="h-4 w-4" />
              Consent management
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Control how your data is used for analytics, marketing, and personalization.
            </p>
            <div className="space-y-3">
              {Object.entries(consents).map(([key, value]) => (
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2" key={key}>
                  <Label htmlFor={`consent-${key}`} className="text-sm">
                    {consentLabels[key] ?? key}
                  </Label>
                  <Switch
                    id={`consent-${key}`}
                    checked={Boolean(value)}
                    onCheckedChange={(checked) => handleConsentChange(key, checked)}
                    disabled={consentSaving}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete account"
        description="This will permanently delete your account and all associated data including child profiles and studies. This action cannot be undone."
        confirmLabel="Delete account"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteLoading}
      />
    </>
  )
}
