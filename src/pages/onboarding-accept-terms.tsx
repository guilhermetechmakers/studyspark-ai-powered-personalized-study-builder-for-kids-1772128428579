/**
 * Onboarding Accept Terms page - Presents ToS and requires acceptance.
 * Used during sign-up flow; gates progression until user accepts.
 */
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ToSPageContainer } from '@/components/terms-of-service'
import { TOS_CONTENT } from '@/data/terms-of-service-content'

export function OnboardingAcceptTermsPage() {
  const navigate = useNavigate()

  const content = TOS_CONTENT ?? { version: '1.0', effectiveDate: '', sections: [] }

  const handleAccept = async () => {
    try {
      // TODO: Replace with actual API when backend is ready
      // await apiPost(`/api/users/:id/accept-tos`, { version: content.version })
      localStorage.setItem('tos_accepted', JSON.stringify({
        version: content.version,
        acceptedAt: new Date().toISOString(),
      }))
      toast.success('Terms accepted. Welcome to StudySpark!')
      navigate('/dashboard', { replace: true })
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  const handleDecline = () => {
    toast.info('You must accept the Terms of Service to continue.')
    navigate('/login', { replace: true })
  }

  return (
    <ToSPageContainer
      content={content}
      locale="en-US"
      showAcceptCard
      onAccept={handleAccept}
      onDecline={handleDecline}
      requireScrollToBottom
    />
  )
}
