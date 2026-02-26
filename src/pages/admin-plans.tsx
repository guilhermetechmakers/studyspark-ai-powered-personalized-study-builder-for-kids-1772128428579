import { useCallback, useEffect, useState } from 'react'
import { Plus, Download, Upload, Tag, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PillBadge, EmptyState, ConfirmationDialog } from '@/components/admin/shared'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchPlans, createPlan, updatePlan, deletePlan, fetchCoupons, createCoupon } from '@/api/admin'
import type { Plan, Coupon } from '@/types/admin'
import { toast } from 'sonner'

export function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [planModal, setPlanModal] = useState<{ open: boolean; plan?: Plan }>({ open: false })
  const [couponModal, setCouponModal] = useState<{ open: boolean; coupon?: Coupon }>({ open: false })
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id?: string; type: 'plan' | 'coupon' }>({
    open: false,
    type: 'plan',
  })

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [pList, cList] = await Promise.all([fetchPlans(), fetchCoupons()])
      setPlans(Array.isArray(pList) ? pList : [])
      setCoupons(Array.isArray(cList) ? cList : [])
    } catch {
      toast.error('Failed to load data')
      setPlans([])
      setCoupons([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleExportPlans = () => {
    const json = JSON.stringify(plans, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `plans-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Plans exported')
  }

  const handleImportPlans = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,.csv'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = file.name.endsWith('.json') ? JSON.parse(text) : parseCSV(text)
        const list = Array.isArray(data) ? data : data?.plans ?? []
        for (const p of list) {
          if (p.name && typeof p.price === 'number') {
            await createPlan({
              name: p.name,
              price: p.price,
              currency: p.currency ?? 'USD',
              cadence: p.cadence ?? 'monthly',
              features: Array.isArray(p.features) ? p.features : [],
              quotas: p.quotas,
              trialDays: p.trialDays,
              active: p.active !== false,
            })
          }
        }
        toast.success('Plans imported')
        loadData()
      } catch {
        toast.error('Invalid file format')
      }
    }
    input.click()
  }

  function parseCSV(text: string): Plan[] {
    const lines = text.split('\n').filter(Boolean)
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map((h) => h.trim())
    return lines.slice(1).map((line) => {
      const vals = line.split(',').map((v) => v.trim())
      const obj: Record<string, unknown> = {}
      headers.forEach((h, i) => {
        obj[h] = vals[i]
      })
      return {
        id: '',
        name: String(obj.name ?? ''),
        price: Number(obj.price ?? 0),
        currency: String(obj.currency ?? 'USD'),
        cadence: (obj.cadence as 'monthly' | 'yearly') ?? 'monthly',
        features: Array.isArray(obj.features) ? obj.features : String(obj.features ?? '').split(';'),
        active: obj.active !== 'false',
      } as Plan
    })
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <header className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Subscription Plans</h1>
        <p className="mt-1 text-muted-foreground">
          Manage plans, pricing, and coupons.
        </p>
      </header>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="rounded-full">
          <TabsTrigger value="plans" className="rounded-full">
            Plans
          </TabsTrigger>
          <TabsTrigger value="coupons" className="rounded-full">
            Coupons
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <Button
                variant="default"
                className="gap-2 rounded-full"
                onClick={() => setPlanModal({ open: true })}
              >
                <Plus className="h-4 w-4" />
                Add Plan
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPlans}>
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleImportPlans}>
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-6 w-24 animate-pulse rounded bg-muted" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-16 animate-pulse rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (plans ?? []).length === 0 ? (
            <EmptyState
              icon={Tag}
              title="No plans yet"
              description="Create your first subscription plan to get started."
              actionLabel="Add Plan"
              onAction={() => setPlanModal({ open: true })}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(plans ?? []).map((plan) => (
                <Card key={plan.id} className="transition-all duration-200 hover:shadow-card-hover">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPlanModal({ open: true, plan })}
                        aria-label="Edit plan"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteConfirm({ open: true, id: plan.id, type: 'plan' })}
                        aria-label="Delete plan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      ${plan.price}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{plan.cadence}
                      </span>
                    </p>
                    <ul className="mt-4 space-y-2">
                      {(plan.features ?? []).map((f, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          • {f}
                        </li>
                      ))}
                    </ul>
                    <PillBadge
                      variant={plan.active ? 'success' : 'outline'}
                      className="mt-4"
                    >
                      {plan.active ? 'Active' : 'Inactive'}
                    </PillBadge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="coupons" className="space-y-6">
          <Button
            variant="default"
            className="gap-2 rounded-full"
            onClick={() => setCouponModal({ open: true })}
          >
            <Plus className="h-4 w-4" />
            Add Coupon
          </Button>

          {(coupons ?? []).length === 0 ? (
            <EmptyState
              icon={Tag}
              title="No coupons yet"
              description="Create promotional coupons for your plans."
              actionLabel="Add Coupon"
              onAction={() => setCouponModal({ open: true })}
            />
          ) : (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-sm font-medium">Code</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Discount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Valid</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  {(coupons ?? []).map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono">{c.code}</td>
                      <td className="px-4 py-3">
                        {c.discountType === 'percent' ? `${c.value}%` : `$${c.value}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {c.validFrom} – {c.validTo}
                      </td>
                      <td className="px-4 py-3">
                        {c.usedCount ?? 0} / {c.usageLimit ?? '∞'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <PlanEditorModal
        open={planModal.open}
        plan={planModal.plan}
        onClose={() => setPlanModal({ open: false })}
        onSaved={() => {
          setPlanModal({ open: false })
          loadData()
        }}
      />

      <CouponEditorModal
        open={couponModal.open}
        coupon={couponModal.coupon}
        onClose={() => setCouponModal({ open: false })}
        onSaved={() => {
          setCouponModal({ open: false })
          loadData()
        }}
      />

      <ConfirmationDialog
        open={deleteConfirm.open}
        onOpenChange={(o) => setDeleteConfirm((s) => ({ ...s, open: o }))}
        title={`Delete ${deleteConfirm.type}?`}
        description="This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          if (deleteConfirm.type === 'plan' && deleteConfirm.id) {
            await deletePlan(deleteConfirm.id)
            toast.success('Plan deleted')
          }
          loadData()
        }}
      />
    </div>
  )
}

function PlanEditorModal({
  open,
  plan,
  onClose,
  onSaved,
}: {
  open: boolean
  plan?: Plan
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(plan?.name ?? '')
  const [price, setPrice] = useState(String(plan?.price ?? 0))
  const [cadence, setCadence] = useState<'monthly' | 'yearly'>(plan?.cadence ?? 'monthly')
  const [features, setFeatures] = useState(plan?.features?.join('\n') ?? '')
  const [active, setActive] = useState(plan?.active ?? true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setName(plan?.name ?? '')
      setPrice(String(plan?.price ?? 0))
      setCadence(plan?.cadence ?? 'monthly')
      setFeatures((plan?.features ?? []).join('\n'))
      setActive(plan?.active ?? true)
    }
  }, [open, plan])

  const handleSubmit = async () => {
    const p = Number(price)
    if (!name.trim() || isNaN(p) || p < 0) {
      toast.error('Invalid plan data')
      return
    }
    setIsSubmitting(true)
    try {
      if (plan?.id) {
        await updatePlan(plan.id, {
          name: name.trim(),
          price: p,
          cadence,
          features: features.split('\n').map((f) => f.trim()).filter(Boolean),
          active,
        })
        toast.success('Plan updated')
      } else {
        await createPlan({
          name: name.trim(),
          price: p,
          currency: 'USD',
          cadence,
          features: features.split('\n').map((f) => f.trim()).filter(Boolean),
          active,
        })
        toast.success('Plan created')
      }
      onSaved()
    } catch {
      toast.error('Failed to save plan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{plan ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="plan-name">Name</Label>
            <Input
              id="plan-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pro"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="plan-price">Price</Label>
              <Input
                id="plan-price"
                type="number"
                min={0}
                step={0.01}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label>Cadence</Label>
              <Select value={cadence} onValueChange={(v) => setCadence(v as 'monthly' | 'yearly')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="plan-features">Features (one per line)</Label>
            <Textarea
              id="plan-features"
              className="min-h-[100px]"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="Unlimited studies&#10;AI-powered"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="plan-active" checked={active} onCheckedChange={setActive} />
            <Label htmlFor="plan-active">Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : plan ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CouponEditorModal({
  open,
  coupon,
  onClose,
  onSaved,
}: {
  open: boolean
  coupon?: Coupon
  onClose: () => void
  onSaved: () => void
}) {
  const [code, setCode] = useState(coupon?.code ?? '')
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>(coupon?.discountType ?? 'percent')
  const [value, setValue] = useState(String(coupon?.value ?? 10))
  const [validFrom, setValidFrom] = useState(coupon?.validFrom ?? '')
  const [validTo, setValidTo] = useState(coupon?.validTo ?? '')
  const [usageLimit, setUsageLimit] = useState(String(coupon?.usageLimit ?? ''))

  useEffect(() => {
    if (open) {
      setCode(coupon?.code ?? '')
      setDiscountType(coupon?.discountType ?? 'percent')
      setValue(String(coupon?.value ?? 10))
      setValidFrom(coupon?.validFrom ?? '')
      setValidTo(coupon?.validTo ?? '')
      setUsageLimit(String(coupon?.usageLimit ?? ''))
    }
  }, [open, coupon])

  const handleSubmit = async () => {
    const v = Number(value)
    const limit = usageLimit ? Number(usageLimit) : undefined
    if (!code.trim() || isNaN(v) || v <= 0) {
      toast.error('Invalid coupon data')
      return
    }
    try {
      await createCoupon({
        code: code.trim().toUpperCase(),
        discountType,
        value: v,
        validFrom: validFrom || new Date().toISOString().slice(0, 10),
        validTo: validTo || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        usageLimit: limit,
      })
      toast.success('Coupon created')
      onSaved()
    } catch {
      toast.error('Failed to create coupon')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Coupon</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="coupon-code">Code</Label>
            <Input
              id="coupon-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="WELCOME20"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Discount Type</Label>
              <Select value={discountType} onValueChange={(v) => setDiscountType(v as 'percent' | 'amount')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percent</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="coupon-value">Value</Label>
              <Input
                id="coupon-value"
                type="number"
                min={0}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="coupon-from">Valid From</Label>
              <Input
                id="coupon-from"
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="coupon-to">Valid To</Label>
              <Input
                id="coupon-to"
                type="date"
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="coupon-limit">Usage Limit (optional)</Label>
            <Input
              id="coupon-limit"
              type="number"
              min={1}
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              placeholder="Unlimited"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
