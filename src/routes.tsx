import { createBrowserRouter } from 'react-router-dom'
import { LandingPage } from '@/pages/landing'
import { LoginPage } from '@/pages/login'
import { VerifyEmailPage } from '@/pages/verify-email'
import { PasswordResetPage } from '@/pages/password-reset'
import { DashboardOverview } from '@/pages/dashboard-overview'
import { StudyLibraryPage } from '@/pages/study-library'
import { CreateStudyWizard } from '@/pages/create-study-wizard'
import { UploadMaterialsPage } from '@/pages/upload-materials'
import { StudyDetailPage } from '@/pages/study-detail'
import { StudyReviewPage } from '@/pages/study-review'
import { StudyViewerPage } from '@/pages/study-viewer'
import { SettingsPage } from '@/pages/settings'
import { CheckoutPage } from '@/pages/checkout'
import { NotFoundPage } from '@/pages/not-found'
import { ErrorPage } from '@/pages/error'
import { AboutHelpPage } from '@/pages/about-help'
import { LegalPage } from '@/pages/legal'
import { PrivacyPolicyPage } from '@/pages/privacy-policy'
import { CookiePolicyPage } from '@/pages/cookie-policy'
import { TermsOfServicePage } from '@/pages/terms-of-service'
import { OnboardingAcceptTermsPage } from '@/pages/onboarding-accept-terms'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminOverviewPage } from '@/pages/admin-overview'
import { AdminUsersPage } from '@/pages/admin-users'
import { AdminModerationPage } from '@/pages/admin-moderation'
import { AdminPlansPage } from '@/pages/admin-plans'
import { AdminAnalyticsPage } from '@/pages/admin-analytics'
import { AdminHealthPage } from '@/pages/admin-health'

const cookiesContent = `
<p>We use cookies and similar technologies to provide and improve our service.</p>
<h3>Essential Cookies</h3>
<p>Required for authentication and core functionality.</p>
<h3>Analytics</h3>
<p>We use analytics to understand usage and improve the product.</p>
<h3>Your Choices</h3>
<p>You can manage cookie preferences in your browser settings.</p>
`

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <LoginPage /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  { path: '/forgot-password', element: <PasswordResetPage /> },
  { path: '/password-reset', element: <PasswordResetPage /> },
  { path: '/help', element: <AboutHelpPage /> },
  { path: '/about', element: <AboutHelpPage /> },
  { path: '/about-help', element: <AboutHelpPage /> },
  { path: '/privacy', element: <PrivacyPolicyPage /> },
  { path: '/privacy-policy', element: <PrivacyPolicyPage /> },
  { path: '/terms', element: <TermsOfServicePage /> },
  { path: '/terms-of-service', element: <TermsOfServicePage /> },
  { path: '/onboarding/accept-terms', element: <OnboardingAcceptTermsPage /> },
  { path: '/cookies', element: <LegalPage title="Cookie Policy" content={cookiesContent} /> },
  { path: '/cookie-policy', element: <CookiePolicyPage /> },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardOverview /> },
      { path: 'studies', element: <StudyLibraryPage /> },
      { path: 'studies/:id', element: <StudyReviewPage /> },
      { path: 'studies/:id/detail', element: <StudyDetailPage /> },
      { path: 'create', element: <CreateStudyWizard /> },
      { path: 'upload-materials', element: <UploadMaterialsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
    ],
  },
  { path: '/study/:id/play', element: <StudyViewerPage /> },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminOverviewPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'moderation', element: <AdminModerationPage /> },
      { path: 'plans', element: <AdminPlansPage /> },
      { path: 'analytics', element: <AdminAnalyticsPage /> },
      { path: 'health', element: <AdminHealthPage /> },
    ],
  },
  { path: '/404', element: <NotFoundPage /> },
  { path: '/500', element: <ErrorPage /> },
  { path: '*', element: <NotFoundPage /> },
])
