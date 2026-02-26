import { createBrowserRouter } from 'react-router-dom'
import { LandingPage } from '@/pages/landing'
import { LoginPage } from '@/pages/login'
import { VerifyEmailPage } from '@/pages/verify-email'
import { PasswordResetPage } from '@/pages/password-reset'
import { AuthCallbackPage } from '@/pages/auth-callback'
import { DashboardOverview } from '@/pages/dashboard-overview'
import { ProfileDashboardPage } from '@/pages/profile-dashboard'
import { ChildManagementPage } from '@/pages/child-management'
import { StudyLibraryPage } from '@/pages/study-library'
import { AnalyticsDashboardPage } from '@/pages/analytics-dashboard'
import { CreateStudyWizard } from '@/pages/create-study-wizard'
import { UploadMaterialsPage } from '@/pages/upload-materials'
import { StudyDetailPage } from '@/pages/study-detail'
import { StudyReviewPage } from '@/pages/study-review'
import { StudyViewerPage } from '@/pages/study-viewer'
import { SettingsPage } from '@/pages/settings'
import { CheckoutPage } from '@/pages/checkout'
import { PaymentsDashboardPage } from '@/pages/payments-dashboard'
import { PaymentsInvoicesPage } from '@/pages/payments-invoices'
import { PaymentsCheckoutPage } from '@/pages/payments-checkout'
import { AdminPaymentsWebhooksPage } from '@/pages/admin-payments-webhooks'
import { AdminWebhooksPage } from '@/pages/admin-webhooks'
import { NotFoundPage } from '@/pages/not-found'
import { ErrorPage } from '@/pages/error'
import { AboutHelpPage } from '@/pages/about-help'
import { PrivacyPolicyPage } from '@/pages/privacy-policy'
import { CookiePolicyPage } from '@/pages/cookie-policy'
import { TermsOfServicePage } from '@/pages/terms-of-service'
import { OnboardingAcceptTermsPage } from '@/pages/onboarding-accept-terms'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminGuard } from '@/components/admin/admin-guard'
import { AdminOverviewPage } from '@/pages/admin-overview'
import { AdminUsersPage } from '@/pages/admin-users'
import { AdminUserModerationPage } from '@/pages/admin-user-moderation'
import { AdminContentReviewPage } from '@/pages/admin-content-review'
import { AdminAuditLogsPage } from '@/pages/admin-audit-logs'
import { AdminSettingsPage } from '@/pages/admin-settings'
import { AdminPlansPage } from '@/pages/admin-plans'
import { AdminAnalyticsPage } from '@/pages/admin-analytics'
import { AdminHealthPage } from '@/pages/admin-health'
import { SearchRedirectPage } from '@/pages/search-redirect'
import { SearchPage } from '@/pages/search-page'
import { ExportPage } from '@/pages/export-page'
import { ExportProgressPage } from '@/pages/export-progress-page'
import { NotificationCenterPage } from '@/pages/notification-center'
import { NotificationPreferencesPage } from '@/pages/notification-preferences'
import { AdminNotificationsPage } from '@/pages/admin-notifications'
import { ProtectedRoute } from '@/components/auth/protected-route'

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <LoginPage /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  { path: '/auth/callback', element: <AuthCallbackPage /> },
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
  { path: '/cookies', element: <CookiePolicyPage /> },
  { path: '/cookie-policy', element: <CookiePolicyPage /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardOverview /> },
      { path: 'profile', element: <ProfileDashboardPage /> },
      { path: 'children', element: <ChildManagementPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'studies', element: <StudyLibraryPage /> },
      { path: 'analytics', element: <AnalyticsDashboardPage /> },
      { path: 'studies/:id', element: <StudyReviewPage /> },
      { path: 'studies/:id/detail', element: <StudyDetailPage /> },
      { path: 'create', element: <CreateStudyWizard /> },
      { path: 'upload-materials', element: <UploadMaterialsPage /> },
      { path: 'export', element: <ExportPage /> },
      { path: 'export-progress', element: <ExportProgressPage /> },
      { path: 'exports', element: <ExportProgressPage /> },
      { path: 'notifications', element: <NotificationCenterPage /> },
      { path: 'notifications/preferences', element: <NotificationPreferencesPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'payments', element: <PaymentsDashboardPage /> },
      { path: 'payments/invoices', element: <PaymentsInvoicesPage /> },
      { path: 'payments/checkout', element: <PaymentsCheckoutPage /> },
      { path: 'analytics', element: <AnalyticsDashboardPage /> },
    ],
  },
  { path: '/study/:id/play', element: <StudyViewerPage /> },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminGuard>
          <AdminLayout />
        </AdminGuard>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminOverviewPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'moderation', element: <AdminUserModerationPage /> },
      { path: 'content-review', element: <AdminContentReviewPage /> },
      { path: 'plans', element: <AdminPlansPage /> },
      { path: 'analytics', element: <AdminAnalyticsPage /> },
      { path: 'audit-logs', element: <AdminAuditLogsPage /> },
      { path: 'notifications', element: <AdminNotificationsPage /> },
      { path: 'health', element: <AdminHealthPage /> },
      { path: 'webhooks', element: <AdminWebhooksPage /> },
      { path: 'payments/webhooks', element: <AdminPaymentsWebhooksPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
    ],
  },
  { path: '/search', element: <SearchRedirectPage /> },
  { path: '/404', element: <NotFoundPage /> },
  { path: '/500', element: <ErrorPage /> },
  { path: '*', element: <NotFoundPage /> },
])
