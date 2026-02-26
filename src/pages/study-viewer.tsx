import { useParams, useNavigate } from 'react-router-dom'
import { StudyViewerContainer } from '@/components/study-viewer'
import { getMockStudySet } from '@/data/study-viewer-mock'

export function StudyViewerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const studyId = id ?? 'default'

  const studySet = getMockStudySet(studyId)

  const handleComplete = () => {
    navigate('/dashboard')
  }

  return (
    <StudyViewerContainer
      studySet={studySet}
      onComplete={handleComplete}
    />
  )
}
