import { Link } from 'react-router-dom'
import {
  BookOpen,
  TrendingUp,
  PlusCircle,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
const mockProgress = [
  { name: 'Mon', completed: 3 },
  { name: 'Tue', completed: 5 },
  { name: 'Wed', completed: 2 },
  { name: 'Thu', completed: 7 },
  { name: 'Fri', completed: 4 },
  { name: 'Sat', completed: 6 },
  { name: 'Sun', completed: 2 },
]

const mockRecentStudies = [
  { id: '1', title: 'Fractions & Decimals', subject: 'Math', updated: '2 hours ago' },
  { id: '2', title: 'World War II', subject: 'History', updated: '1 day ago' },
  { id: '3', title: 'Photosynthesis', subject: 'Science', updated: '2 days ago' },
]

export function DashboardOverview() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's how your children are doing.
        </p>
      </div>

      {/* Progress overview cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-[rgb(var(--peach-light))]/30 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Studies This Week
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">+3</span> from last week
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[rgb(var(--lavender))]/20 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">29</div>
            <p className="text-xs text-muted-foreground">
              Total activities finished
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Children
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Active profiles
            </p>
          </CardContent>
        </Card>
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quick Create
            </CardTitle>
            <PlusCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <Button asChild className="mt-2 w-full">
              <Link to="/dashboard/create">
                Create Study
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly progress chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>Activities completed per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockProgress}>
                  <XAxis dataKey="name" stroke="rgb(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="rgb(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(var(--card))',
                      border: '1px solid rgb(var(--border))',
                      borderRadius: '0.75rem',
                    }}
                  />
                  <Bar
                    dataKey="completed"
                    fill="rgb(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent studies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Studies</CardTitle>
              <CardDescription>Your latest study sets</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/studies">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentStudies.map((study) => (
                <Link
                  key={study.id}
                  to={`/dashboard/studies/${study.id}`}
                  className="block rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{study.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {study.subject} · {study.updated}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended / Help */}
      <Card className="bg-gradient-to-br from-[rgb(var(--lavender))]/10 to-[rgb(var(--tangerine))]/10">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-6 md:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Need help getting started?</h3>
              <p className="text-sm text-muted-foreground">
                Check out our tutorial or contact support.
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link to="/help">Help Center</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
