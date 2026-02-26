import { useCallback, useEffect, useState } from 'react'
import { Download, TrendingUp, Users, DollarSign, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer } from '@/components/admin/shared'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { fetchAnalyticsKpis, fetchAnalyticsCharts } from '@/api/admin'
import { toast } from 'sonner'

const CHART_COLORS = {
  primary: 'rgb(var(--primary))',
  accent: 'rgb(var(--tangerine))',
  lavender: 'rgb(var(--lavender))',
  violet: 'rgb(var(--violet))',
}

export function AdminAnalyticsPage() {
  const [kpis, setKpis] = useState<{
    mau: number
    mrr: number
    churn: number
    newSignups: number
    activeSubscriptions: number
    creationVolume: number
  } | null>(null)
  const [chartData, setChartData] = useState<Array<{
    time: string
    mau: number
    mrr: number
    churn: number
    newSignups: number
    activeSubscriptions: number
  }>>([])
  const [range, setRange] = useState<string>('30d')
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = { range }
      const [k, c] = await Promise.all([
        fetchAnalyticsKpis(params),
        fetchAnalyticsCharts(undefined, undefined, params),
      ])
      setKpis(k)
      setChartData(Array.isArray(c) ? c : [])
    } catch {
      toast.error('Failed to load analytics')
      setKpis(null)
      setChartData([])
    } finally {
      setIsLoading(false)
    }
  }, [range])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleExportCSV = () => {
    const headers = ['Period', 'MAU', 'MRR', 'Churn', 'New Signups', 'Active Subscriptions']
    const rows = (chartData ?? []).map((d) =>
      [d.time, d.mau, d.mrr, d.churn, d.newSignups, d.activeSubscriptions].join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report exported')
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            KPIs, trends, and exportable reports.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="yoy">Year over year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">MAU</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{(kpis?.mau ?? 0).toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-accent/5 to-accent/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">MRR</CardTitle>
                  <DollarSign className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${(kpis?.mrr ?? 0).toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Churn</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{(kpis?.churn ?? 0)}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Subscriptions
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {(kpis?.activeSubscriptions ?? 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartContainer title="MAU & Active Subscriptions">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData ?? []} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                  <XAxis dataKey="time" stroke="rgb(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="rgb(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgb(var(--border))',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="mau"
                    name="MAU"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    dot={{ r: 4, fill: CHART_COLORS.primary }}
                  />
                  <Line
                    type="monotone"
                    dataKey="activeSubscriptions"
                    name="Active Subscriptions"
                    stroke={CHART_COLORS.accent}
                    strokeWidth={2}
                    dot={{ r: 4, fill: CHART_COLORS.accent }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="MRR Trend">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData ?? []} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                  <XAxis dataKey="time" stroke="rgb(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="rgb(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgb(var(--border))',
                    }}
                  />
                  <Bar
                    dataKey="mrr"
                    name="MRR"
                    fill={CHART_COLORS.lavender}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <ChartContainer title="New Signups & Churn">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData ?? []} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                <XAxis dataKey="time" stroke="rgb(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="rgb(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid rgb(var(--border))',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="newSignups"
                  name="New Signups"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  dot={{ r: 4, fill: CHART_COLORS.primary }}
                />
                <Line
                  type="monotone"
                  dataKey="churn"
                  name="Churn %"
                  stroke={CHART_COLORS.accent}
                  strokeWidth={2}
                  dot={{ r: 4, fill: CHART_COLORS.accent }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </>
      )}
    </div>
  )
}
