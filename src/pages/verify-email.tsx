import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import {
  InstructionPanel,
  ResendVerificationButton,
  StatusPanel,
  SupportLink,
} from '@/components/email-verification'
import {
  postResendVerification,
  getVerificationStatus,
  type VerificationStatus,
} from '@/api/auth'
import { cn } from '@/lib/utils'

const COOLDOWN_SECONDS = 60
const POLL_INTERVAL_MS = 20_000
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [status, setStatus] = useState<VerificationStatus>('pending')
  const [email, setEmail] = useState<string>('')
  const [cooldown, setCooldown] = useState<number>(0)
  const [isResending, setIsResending] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await getVerificationStatus()
      const newStatus = (res?.status ?? 'pending') as VerificationStatus
      const newEmail = res?.email ?? email
      setStatus(newStatus)
      if (newEmail) setEmail((prev) => prev || newEmail)
      return newStatus
    } catch {
      setStatus('error')
      return 'error' as VerificationStatus
    }
  }, [email])

  useEffect(() => {
    const stateEmail = (location.state as { email?: string } | null)?.email ?? ''
    const init = async () => {
      const res = await getVerificationStatus()
      const s = (res?.status ?? 'pending') as VerificationStatus
      const e = res?.email ?? (stateEmail && EMAIL_REGEX.test(stateEmail) ? stateEmail : '')
      setStatus(s)
      setEmail((prev) => prev || e)
    }
    init()
  }, [])

  useEffect(() => {
    if (status !== 'pending') {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
      return
    }
    pollRef.current = setInterval(() => {
      fetchStatus().then((s) => {
        if (s === 'verified' && pollRef.current) {
          clearInterval(pollRef.current)
          pollRef.current = null
        }
      })
    }, POLL_INTERVAL_MS)
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [status, fetchStatus])

  useEffect(() => {
    if (cooldown <= 0) return
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (cooldownRef.current) {
            clearInterval(cooldownRef.current)
            cooldownRef.current = null
          }
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current)
        cooldownRef.current = null
      }
    }
  }, [cooldown])

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return
    const toSend = email.trim()
    if (!toSend || !EMAIL_REGEX.test(toSend)) {
      toast.error('Please provide a valid email address.')
      return
    }
    setIsResending(true)
    try {
      await postResendVerification(toSend)
      toast.success('Verification email sent! Check your inbox.')
      setCooldown(COOLDOWN_SECONDS)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send. Please try again.'
      toast.error(msg)
    } finally {
      setIsResending(false)
    }
  }

  const handleContinue = () => {
    navigate('/dashboard', { replace: true })
  }

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col items-center justify-center p-4',
        'bg-gradient-to-br from-[rgb(var(--peach-light))]/20 via-background to-[rgb(var(--lavender))]/10'
      )}
    >
      <div className="w-full max-w-md space-y-6 animate-fade-in-up">
        <Link
          to="/"
          className="mb-8 flex items-center justify-center gap-2 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(var(--lavender))] to-[rgb(var(--violet))] text-white shadow-md">
            <Sparkles className="h-6 w-6" aria-hidden />
          </div>
          <span className="text-2xl font-bold text-foreground">StudySpark</span>
        </Link>

        <InstructionPanel />

        <div className="space-y-4">
          <ResendVerificationButton
            cooldown={cooldown}
            onResend={handleResend}
            isLoading={isResending}
          />
          <StatusPanel
            status={status}
            email={email}
            onContinue={handleContinue}
          />
          <SupportLink />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            to="/login"
            className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
