import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Shield, CreditCard, BarChart3, Activity, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchAnalyticsKpis, fetchSystemHealthSummary } from '@/api/admin'

const quickLinks = [
  { to: '/admin/users', label: 'User Management', icon: Users },
  { to: '/admin/moderation', label: 'Content Moderation', icon: Shield },
  { to: '/admin/plans', label: 'Subscription Plans', icon: CreditCard },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/health', label: 'System Health', icon: Activity },
]

export function AdminOverviewPage() {
  const [kpis, setKpis] = useState<{
    mau: number
    mrr: number
    churn: number
    newSignups: number
    activeSubscriptions: number
    creationVolume: number
  } | null>(null)
  const [health, setHealth] = useState<{
    queueBacklog: number
    aiApiUsage: number
    errorCount: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [k, h] = await Promise.all([fetchAnalyticsKpis(), fetchSystemHealthSummary()])
        if (!cancelled) {
          setKpis(k)
          setHealth(h)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-1 flex-col gap-8 p-6">
      <header className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          System overview and quick access to administration tools.
        </p>
      </header>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <section aria-labelledby="kpis-heading">
            <h2 id="kpis-heading" className="sr-only">
              Key metrics
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-gradient-to-br from-primary/5 to-accent/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">MAU</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">
                    {(kpis?.mau ?? 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">MRR</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">
                    ${(kpis?.mrr ?? 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Subscriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">
                    {(kpis?.activeSubscriptions ?? 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Churn</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">{(kpis?.churn ?? 0)}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    New Signups
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">
                    {(kpis?.newSignups ?? 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Creation Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">
                    {(kpis?.creationVolume ?? 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {health && (
            <section aria-labelledby="health-heading">
              <h2 id="health-heading" className="mb-4 text-lg font-semibold">
                System Health
              </h2>
              <div className="flex flex-wrap gap-4">
                <div className="rounded-2xl border border-border bg-card px-4 py-3">
                  <p className="text-xs text-muted-foreground">Queue Backlog</p>
                  <p className="text-xl font-bold">{health.queueBacklog}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card px-4 py-3">
                  <p className="text-xs text-muted-foreground">AI API Usage</p>
                  <p className="text-xl font-bold">{health.aiApiUsage}%</p>
                </div>
                <div className="rounded-2xl border border-border bg-card px-4 py-3">
                  <p className="text-xs text-muted-foreground">Errors (24h)</p>
                  <p className="text-xl font-bold text-destructive">{health.errorCount}</p>
                </div>
              </div>
            </section>
          )}

          <section aria-labelledby="quick-links-heading">
            <h2 id="quick-links-heading" className="mb-4 text-lg font-semibold">
              Quick Links
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(quickLinks ?? []).map((link) => {
                const Icon = link.icon
                return (
                  <Link key={link.to} to={link.to}>
                    <Card className="transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
                      <CardContent className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Icon className="h-6 w-6" />
                          </div>
                          <span className="font-medium">{link.label}</span>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
