import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

const COOLDOWN_SECONDS = 60

export function VerifyEmailPage() {
  const [cooldown, setCooldown] = useState(0)

  const handleResend = async () => {
    if (cooldown > 0) return
    try {
      // TODO: Supabase resend verification
      await new Promise((r) => setTimeout(r, 500))
      toast.success('Verification email sent!')
      setCooldown(COOLDOWN_SECONDS)
      const interval = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(interval)
            return 0
          }
          return c - 1
        })
      }, 1000)
    } catch {
      toast.error('Failed to send. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[rgb(var(--peach-light))]/20 via-background to-[rgb(var(--lavender))]/10 p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(var(--lavender))] to-[rgb(var(--violet))] text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold text-foreground">StudySpark</span>
        </Link>
        <Card>
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-center">Check your email</CardTitle>
            <CardDescription className="text-center">
              We've sent a verification link to your email address. Click the link to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={cooldown > 0}
            >
              {cooldown > 0
                ? `Resend in ${cooldown}s`
                : 'Resend verification email'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Didn't receive the email? Check spam or{' '}
              <a href="mailto:support@studyspark.com" className="text-primary hover:underline">
                contact support
              </a>
            </p>
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" className="hover:text-foreground">
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
