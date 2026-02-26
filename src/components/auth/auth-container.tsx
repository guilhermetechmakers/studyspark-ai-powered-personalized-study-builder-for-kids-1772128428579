import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertBar } from './alert-bar'
import { EmailAuthForm } from './email-auth-form'
import { SignUpForm } from './signup-form'
import { SocialAuthButtons } from './social-auth-buttons'
import { ChildProfileWizard } from './child-profile-wizard'
import { login, signup, saveOnboardingChildren } from '@/api/auth'
import type { LoginFormData } from './email-auth-form'
import type { SignUpFormData } from './signup-form'
import type { ChildProfile } from '@/types/auth'
import { toast } from 'sonner'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useState } from 'react'

export function AuthContainer() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isSignup = location.pathname === '/signup'

  const getRedirectPath = (): string => {
    const fromState = (location.state as { from?: { pathname: string } } | null)?.from?.pathname
    if (fromState && fromState !== '/login' && fromState !== '/signup') return fromState
    const redirectParam = searchParams.get('redirect')
    if (redirectParam) {
      try {
        const decoded = decodeURIComponent(redirectParam)
        if (decoded.startsWith('/') && decoded !== '/login' && decoded !== '/signup') return decoded
      } catch {
        // ignore
      }
    }
    return '/dashboard'
  }

  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null)
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [userId, setUserId] = useState<string>('')

  const clearAlert = () => setAlert(null)

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true)
    clearAlert()
    try {
      await login(data.email, data.password)
      toast.success('Welcome back!')
      navigate(getRedirectPath(), { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password'
      setAlert({ type: 'error', message: msg })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (data: SignUpFormData) => {
    setIsLoading(true)
    clearAlert()
    try {
      const res = await signup(data.name, data.email, data.password)
      setUserId(res?.user?.id ?? '')
      const needsEmailVerification = res?.needsEmailVerification === true
      if (needsEmailVerification) {
        toast.success('Check your email to verify your account')
        navigate('/verify-email', { state: { email: data.email } })
        return
      }
      if (res?.onboardingRequired) {
        setOnboardingOpen(true)
      } else {
        toast.success('Account created!')
        navigate(getRedirectPath(), { replace: true })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setAlert({ type: 'error', message: msg })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialError = (message: string) => {
    setAlert({ type: 'error', message })
  }

  const handleOnboardingComplete = async (profiles: ChildProfile[]) => {
    await saveOnboardingChildren(profiles)
    toast.success('Profiles saved!')
    setOnboardingOpen(false)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[rgb(var(--peach-light))]/20 via-background to-[rgb(var(--lavender))]/10 p-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-8 flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(var(--lavender))] to-[rgb(var(--violet))] text-white shadow-md">
            <Sparkles className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold text-foreground">StudySpark</span>
        </Link>

        <Card className="shadow-card transition-all duration-300 hover:shadow-card-hover">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Log in or create an account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            {alert && (
              <div className="mb-4">
                <AlertBar type={alert.type} message={alert.message} />
              </div>
            )}

            <Tabs
              key={location.pathname}
              defaultValue={isSignup ? 'signup' : 'login'}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6 space-y-4">
                <EmailAuthForm
                  mode="login"
                  onSubmit={handleLogin}
                  isLoading={isLoading}
                />
                <SocialAuthButtons onError={handleSocialError} disabled={isLoading} />
              </TabsContent>

              <TabsContent value="signup" className="mt-6 space-y-4">
                <SignUpForm onSubmit={handleSignup} isLoading={isLoading} />
                <SocialAuthButtons onError={handleSocialError} disabled={isLoading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>

      <ChildProfileWizard
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        onComplete={handleOnboardingComplete}
        onSkip={() => navigate('/dashboard')}
        userId={userId}
      />
    </div>
  )
}
