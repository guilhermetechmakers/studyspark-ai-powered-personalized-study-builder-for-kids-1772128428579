import { useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Sparkles, KeyRound, Lock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PasswordResetRequestForm, PasswordResetConfirmForm } from '@/components/password-reset'
import { hasRecoverySession } from '@/api/auth'
import { toast } from 'sonner'

export function PasswordResetPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tokenFromQuery = searchParams.get('token') ?? ''

  const { hasToken, isTokenValid, tokenExpiresIn } = useMemo(() => {
    const recovery = hasRecoverySession()
    const hasQueryToken = tokenFromQuery.length > 0

    if (recovery) {
      return {
        hasToken: true,
        isTokenValid: true,
        tokenExpiresIn: 'Reset links expire in 1 hour. Set your new password below.' as string,
      }
    }
    if (hasQueryToken) {
      return {
        hasToken: true,
        isTokenValid: true,
        tokenExpiresIn: 'Set your new password below.' as string,
      }
    }
    return { hasToken: false, isTokenValid: false, tokenExpiresIn: undefined }
  }, [tokenFromQuery])

  const handleConfirmSuccess = () => {
    toast.success('Password updated! You can now sign in.')
    navigate('/login', { replace: true })
  }

  const showConfirmForm = hasToken

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[rgb(var(--peach-light))]/20 via-background to-[rgb(var(--lavender))]/10 p-4">
      <div className="w-full max-w-md animate-fade-in">
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              {showConfirmForm ? (
                <Lock className="h-8 w-8 text-primary" />
              ) : (
                <KeyRound className="h-8 w-8 text-primary" />
              )}
            </div>
            <CardTitle className="text-center">
              {showConfirmForm ? 'Set new password' : 'Reset password'}
            </CardTitle>
            <CardDescription className="text-center">
              {showConfirmForm
                ? 'Choose a strong password for your account.'
                : "Enter your email and we'll send you a link to reset your password."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showConfirmForm ? (
              <PasswordResetConfirmForm
                isTokenValid={isTokenValid}
                tokenExpiresIn={tokenExpiresIn}
                onSuccess={handleConfirmSuccess}
              />
            ) : (
              <PasswordResetRequestForm />
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            to="/login"
            className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
