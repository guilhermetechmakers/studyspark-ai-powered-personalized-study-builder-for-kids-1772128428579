import { useNavigate } from 'react-router-dom'
import {
  DashboardShell,
  DashboardOverviewMetrics,
  ProgressOverviewGrid,
  RecentStudiesList,
  QuickCreateCard,
  RecommendedStudiesCarousel,
  HelpWidget,
  DashboardFooter,
} from '@/components/dashboard'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import type { Study, Recommendation } from '@/types/dashboard'

export function DashboardOverview() {
  const navigate = useNavigate()
  const {
    overview,
    children,
    studies,
    recommendations,
    isLoading,
    error,
    refetch,
    setStudies,
    setRecommendations,
  } = useDashboardData()

  const handleSaveRecommendation = (rec: Recommendation) => {
    const newStudy: Study = {
      id: `rec-${rec.id}`,
      title: rec.topic,
      updatedAt: 'Just now',
      status: 'saved',
    }
    setStudies((prev) => [newStudy, ...(Array.isArray(prev) ? prev : [])])
    setRecommendations((prev) =>
      (Array.isArray(prev) ? prev : []).filter((r) => r.id !== rec.id)
    )
  }

  const handleDuplicateStudy = (study: Study) => {
    const newStudy: Study = {
      id: `dup-${Date.now()}`,
      title: `${study.title} (copy)`,
      updatedAt: 'Just now',
      status: 'saved',
    }
    setStudies((prev) => [newStudy, ...(Array.isArray(prev) ? prev : [])])
  }

  return (
    <DashboardShell>
      <div className="flex flex-1 flex-col gap-8 p-6">
        <header className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back! Here&apos;s how your children are doing.
          </p>
        </header>

        {error && (
          <section
            className="animate-fade-in-up rounded-xl border border-destructive/50 bg-destructive/10 p-4"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                <div>
                  <p className="font-medium text-foreground">
                    Unable to load dashboard data
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                aria-label="Retry loading dashboard data"
              >
                Retry
              </Button>
            </div>
          </section>
        )}

        <section
          className="animate-fade-in-up space-y-2"
          style={{ animationDelay: '50ms' }}
          aria-labelledby="overview-heading"
        >
          <h2 id="overview-heading" className="sr-only">
            Overview metrics
          </h2>
          <DashboardOverviewMetrics overview={overview} isLoading={isLoading} />
        </section>

        <section
          className="animate-fade-in-up space-y-2"
          style={{ animationDelay: '50ms' }}
          aria-labelledby="progress-heading"
        >
          <h2 id="progress-heading" className="sr-only">
            Child progress overview
          </h2>
          <ProgressOverviewGrid children={children} isLoading={isLoading} />
        </section>

        <div
          className="grid animate-fade-in-up gap-8 lg:grid-cols-3"
          style={{ animationDelay: '100ms' }}
        >
          <section
            className="space-y-6 lg:col-span-2"
            aria-labelledby="recent-studies-heading"
          >
            <h2 id="recent-studies-heading" className="sr-only">
              Recent studies
            </h2>
            <RecentStudiesList
              studies={studies}
              isLoading={isLoading}
              onDuplicate={handleDuplicateStudy}
            />
          </section>
          <section aria-labelledby="quick-create-heading">
            <h2 id="quick-create-heading" className="sr-only">
              Quick create
            </h2>
            <QuickCreateCard
              onUseMaterials={() => navigate('/dashboard/create')}
              onStartFromTemplate={() => navigate('/dashboard/create')}
            />
          </section>
        </div>

        <section
          className="space-y-4"
          aria-labelledby="recommendations-heading"
        >
          <h2 id="recommendations-heading" className="sr-only">
            Recommended studies
          </h2>
          <RecommendedStudiesCarousel
            recommendations={recommendations}
            isLoading={isLoading}
            onSave={handleSaveRecommendation}
            onView={() => {}}
            onStart={() => navigate('/dashboard/create')}
          />
        </section>

        <HelpWidget />

        <DashboardFooter />
      </div>
    </DashboardShell>
  )
}
