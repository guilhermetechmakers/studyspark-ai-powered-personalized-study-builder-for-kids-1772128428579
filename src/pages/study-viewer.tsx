import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { StudyViewerContainer } from '@/components/study-viewer'
import { getMockStudySet } from '@/data/study-viewer-mock'
import { useStudyPlayer, useAttemptSubmit } from '@/hooks/use-study-player'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function StudyViewerPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const studyId = id ?? ''
  const childId = searchParams.get('childId') ?? searchParams.get('child_id') ?? undefined

  const { studySet, sessionToken, isLoading, error, retry } = useStudyPlayer({
    studyId: studyId || null,
    childId: childId || null,
  })
  const handleAttemptSubmit = useAttemptSubmit(sessionToken)

  const mockSet = studyId ? null : getMockStudySet('default')
  const displaySet = studySet ?? mockSet

  const handleComplete = () => {
    navigate('/dashboard')
  }

  if (studyId && isLoading) {
    return (
      <div className="container flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <Skeleton className="h-64 w-full max-w-2xl rounded-3xl" />
        <Skeleton className="h-32 w-full max-w-2xl rounded-2xl" />
      </div>
    )
  }

  if (studyId && error && !displaySet) {
    return (
      <div className="container flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={retry} variant="outline">
          Retry
        </Button>
        <Button onClick={() => navigate('/dashboard')} variant="ghost">
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <StudyViewerContainer
      studySet={displaySet}
      onComplete={handleComplete}
      sessionToken={sessionToken ?? undefined}
      onAttemptSubmit={handleAttemptSubmit}
    />
  )
}
