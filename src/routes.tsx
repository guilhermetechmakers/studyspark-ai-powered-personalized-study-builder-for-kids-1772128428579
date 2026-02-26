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
import { NotFoundPage } from '@/pages/not-found'
import { ErrorPage } from '@/pages/error'
import { HelpPage } from '@/pages/help'
import { LegalPage } from '@/pages/legal'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

const privacyContent = `
<p>StudySpark ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.</p>
<h3>Information We Collect</h3>
<p>We collect information you provide directly, such as account details, child profiles, and uploaded materials. We also collect usage data to improve our services.</p>
<h3>How We Use Your Information</h3>
<p>We use your information to provide, maintain, and improve our services; to personalize content; and to communicate with you. We do not sell your personal information.</p>
<h3>Children's Privacy</h3>
<p>We comply with COPPA and GDPR. We collect minimal child data necessary for the service. Parents control all child profiles and data.</p>
<h3>Data Security</h3>
<p>We use encryption and secure storage. Access is restricted and audited.</p>
<h3>Contact</h3>
<p>For questions, contact us at privacy@studyspark.com.</p>
`

const termsContent = `
<p>By using StudySpark, you agree to these Terms of Service.</p>
<h3>Use of Service</h3>
<p>You must use the service in compliance with applicable laws. You are responsible for the content you upload and the accuracy of information provided.</p>
<h3>Account</h3>
<p>You must provide accurate account information. You are responsible for maintaining the security of your account.</p>
<h3>Intellectual Property</h3>
<p>You retain ownership of your content. You grant us a license to process and display it for the service.</p>
<h3>Limitation of Liability</h3>
<p>StudySpark is provided "as is." We are not liable for indirect or consequential damages.</p>
<h3>Changes</h3>
<p>We may update these terms. Continued use constitutes acceptance.</p>
`

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
  { path: '/help', element: <HelpPage /> },
  { path: '/about', element: <HelpPage /> },
  { path: '/privacy', element: <LegalPage title="Privacy Policy" content={privacyContent} /> },
  { path: '/terms', element: <LegalPage title="Terms of Service" content={termsContent} /> },
  { path: '/cookies', element: <LegalPage title="Cookie Policy" content={cookiesContent} /> },
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
    ],
  },
  { path: '/study/:id/play', element: <StudyViewerPage /> },
  { path: '/404', element: <NotFoundPage /> },
  { path: '/500', element: <ErrorPage /> },
  { path: '*', element: <NotFoundPage /> },
])
