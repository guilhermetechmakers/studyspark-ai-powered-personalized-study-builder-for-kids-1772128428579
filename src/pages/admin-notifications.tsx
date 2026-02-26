/**
 * Admin Notifications - Email templates and delivery analytics.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Mail,
  Plus,
  Pencil,
  Trash2,
  Send,
  BarChart3,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  fetchEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  sendTestEmail,
  fetchDeliveryStats,
  type EmailTemplate,
  type DeliveryStats,
} from '@/api/notifications'
import { toast } from 'sonner'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function AdminNotificationsPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [stats, setStats] = useState<DeliveryStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [testOpen, setTestOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [testEmail, setTestEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    subject: '',
    htmlBody: '',
    textBody: '',
    isActive: true,
  })

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const [t, s] = await Promise.all([
        fetchEmailTemplates(),
        fetchDeliveryStats(),
      ])
      setTemplates(t ?? [])
      setStats(s ?? null)
    } catch {
      setTemplates([])
      setStats(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async () => {
    if (!form.name.trim() || !form.subject.trim() || !form.htmlBody.trim()) {
      toast.error('Name, subject, and HTML body are required')
      return
    }
    setSaving(true)
    try {
      const created = await createEmailTemplate({
        name: form.name,
        subject: form.subject,
        htmlBody: form.htmlBody,
        textBody: form.textBody || undefined,
        isActive: form.isActive,
      })
      if (created) {
        setTemplates((prev) => [created, ...(prev ?? [])])
        setCreateOpen(false)
        setForm({ name: '', subject: '', htmlBody: '', textBody: '', isActive: true })
        toast.success('Template created')
      }
    } catch {
      toast.error('Failed to create template')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedTemplate) return
    if (!form.name.trim() || !form.subject.trim() || !form.htmlBody.trim()) {
      toast.error('Name, subject, and HTML body are required')
      return
    }
    setSaving(true)
    try {
      const updated = await updateEmailTemplate(selectedTemplate.id, {
        name: form.name,
        subject: form.subject,
        htmlBody: form.htmlBody,
        textBody: form.textBody || null,
        isActive: form.isActive,
      })
      if (updated) {
        setTemplates((prev) =>
          (prev ?? []).map((t) => (t.id === updated.id ? updated : t))
        )
        setEditOpen(false)
        setSelectedTemplate(null)
        toast.success('Template updated')
      }
    } catch {
      toast.error('Failed to update template')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return
    try {
      const ok = await deleteEmailTemplate(id)
      if (ok) {
        setTemplates((prev) => (prev ?? []).filter((t) => t.id !== id))
        toast.success('Template deleted')
      }
    } catch {
      toast.error('Failed to delete template')
    }
  }

  const handleTestSend = async () => {
    if (!selectedTemplate || !testEmail.trim()) {
      toast.error('Enter an email address')
      return
    }
    setSaving(true)
    try {
      const ok = await sendTestEmail(selectedTemplate.id, testEmail.trim())
      if (ok) {
        setTestOpen(false)
        setTestEmail('')
        toast.success('Test email sent')
      } else {
        toast.error('Failed to send test email')
      }
    } catch {
      toast.error('Failed to send test email')
    } finally {
      setSaving(false)
    }
  }

  const chartData = stats
    ? [
        { name: 'Total', value: stats.total, fill: 'rgb(var(--primary))' },
        { name: 'Delivered', value: stats.delivered, fill: 'rgb(var(--success))' },
        { name: 'Opened', value: stats.opened, fill: 'rgb(var(--lavender))' },
        { name: 'Clicked', value: stats.clicked, fill: 'rgb(var(--tangerine))' },
        { name: 'Bounced', value: stats.bounced, fill: 'rgb(var(--warning))' },
        { name: 'Failed', value: stats.failed, fill: 'rgb(var(--destructive))' },
      ]
    : []

  return (
    <main
      className="container mx-auto max-w-6xl space-y-6 p-4 animate-fade-in sm:p-6"
      aria-labelledby="admin-notifications-heading"
    >
      <h1
        className="text-2xl font-bold text-foreground md:text-3xl"
        id="admin-notifications-heading"
      >
        Notifications & Email
      </h1>
      <p className="text-muted-foreground">
        Manage email templates and view delivery analytics
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-2 border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Delivery stats
            </CardTitle>
            <CardDescription>
              Email delivery overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{stats?.total ?? 0}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Delivered</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats?.delivered ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Opened</p>
                    <p className="text-2xl font-bold">{stats?.opened ?? 0}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Clicked</p>
                    <p className="text-2xl font-bold">{stats?.clicked ?? 0}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Bounced</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {stats?.bounced ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold text-destructive">
                      {stats?.failed ?? 0}
                    </p>
                  </div>
                </div>
                {chartData.length > 0 && (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="rgb(var(--primary))"
                          fill="rgb(var(--primary))"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-2 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Email templates
                </CardTitle>
                <CardDescription>
                  Create and manage templates
                </CardDescription>
              </div>
              <Button
                size="sm"
                className="rounded-full gap-1.5"
                onClick={() => {
                  setForm({
                    name: '',
                    subject: '',
                    htmlBody: '',
                    textBody: '',
                    isActive: true,
                  })
                  setCreateOpen(true)
                }}
              >
                <Plus className="h-4 w-4" />
                New
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (templates ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12">
                <Mail className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No templates yet</p>
                <Button
                  variant="outline"
                  onClick={() => setCreateOpen(true)}
                  className="rounded-full"
                >
                  Create template
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {(templates ?? []).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t.subject}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedTemplate(t)
                          setForm({
                            name: t.name,
                            subject: t.subject,
                            htmlBody: t.htmlBody,
                            textBody: t.textBody ?? '',
                            isActive: t.isActive,
                          })
                          setEditOpen(true)
                        }}
                        aria-label="Edit template"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedTemplate(t)
                          setTestEmail('')
                          setTestOpen(true)
                        }}
                        aria-label="Send test"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(t.id)}
                        className="text-destructive hover:text-destructive"
                        aria-label="Delete template"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create template</DialogTitle>
            <DialogDescription>
              Add a new email template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-name">Name</Label>
              <Input
                id="create-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Welcome email"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="create-subject">Subject</Label>
              <Input
                id="create-subject"
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject: e.target.value }))
                }
                placeholder="e.g. Welcome to StudySpark!"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="create-html">HTML body</Label>
              <textarea
                id="create-html"
                value={form.htmlBody}
                onChange={(e) =>
                  setForm((f) => ({ ...f, htmlBody: e.target.value }))
                }
                placeholder="<p>Hello {{name}}</p>"
                className="mt-1 w-full min-h-[120px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit template</DialogTitle>
            <DialogDescription>
              Update template content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-subject">Subject</Label>
              <Input
                id="edit-subject"
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-html">HTML body</Label>
              <textarea
                id="edit-html"
                value={form.htmlBody}
                onChange={(e) =>
                  setForm((f) => ({ ...f, htmlBody: e.target.value }))
                }
                className="mt-1 w-full min-h-[120px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={testOpen} onOpenChange={setTestOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send test email</DialogTitle>
            <DialogDescription>
              Send a test email for &quot;{selectedTemplate?.name ?? ''}&quot;
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="test-email">Email address</Label>
            <Input
              id="test-email"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTestSend} disabled={saving || !testEmail.trim()}>
              {saving ? 'Sending...' : 'Send test'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
