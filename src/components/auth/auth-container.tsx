import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Sparkles, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
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
import { useState, useEffect, useCallback } from 'react'
import { useAuthContextOptional } from '@/contexts/auth-context'

export function AuthContainer() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const auth = useAuthContextOptional()
  const isSignup = location.pathname === '/signup'

  const getRedirectPath = useCallback((): string => {
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
  }, [location.state, location.pathname, searchParams])

  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null)
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [userId, setUserId] = useState<string>('')

  const clearAlert = () => setAlert(null)

  useEffect(() => {
    if (auth?.isLoading) return
    if (auth?.isAuthenticated && auth?.user) {
      navigate(getRedirectPath(), { replace: true })
    }
  }, [auth?.isLoading, auth?.isAuthenticated, auth?.user, navigate, getRedirectPath])

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
      toast.error(msg)
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
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialError = (message: string) => {
    setAlert({ type: 'error', message })
    toast.error(message)
  }

  const handleOnboardingComplete = async (profiles: ChildProfile[]) => {
    await saveOnboardingChildren(profiles)
    toast.success('Profiles saved!')
    setOnboardingOpen(false)
    navigate('/dashboard')
  }

  if (auth?.isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[rgb(var(--peach-light))]/20 via-background to-[rgb(var(--lavender))]/10 p-4"
        role="status"
        aria-label="Loading authentication"
      >
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          <div className="flex justify-center">
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
          <Card className="shadow-card">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="flex justify-center pt-4">
                <Loader2 className="h-8 w-8 animate-pulse text-primary" aria-hidden />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[rgb(var(--peach-light))]/20 via-background to-[rgb(var(--lavender))]/10 p-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-8 flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
          aria-label="Go to StudySpark home"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(var(--lavender))] to-[rgb(var(--violet))] text-primary-foreground shadow-md">
            <Sparkles className="h-6 w-6" aria-hidden />
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
              aria-label="Authentication method"
            >
              <TabsList className="grid w-full grid-cols-2" aria-label="Sign in or sign up">
                <TabsTrigger value="login" aria-label="Sign in to your account">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" aria-label="Create a new account">
                  Sign Up
                </TabsTrigger>
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
          <Link
            to="/"
            className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            aria-label="Return to StudySpark home page"
          >
            ← Back to home
          </Link>
        </p>
      </div>

      <ChildProfileWizard
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        onComplete={handleOnboardingComplete}
        onSkip={() => {
          toast.info('You can add child profiles later from settings')
          navigate('/dashboard')
        }}
        userId={userId}
      />
    </div>
  )
}
