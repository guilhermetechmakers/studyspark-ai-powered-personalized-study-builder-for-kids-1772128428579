/**
 * Auth API - Login, signup, OAuth, password reset, logout.
 * Uses Supabase Auth when configured; falls back to mock for development.
 * All responses validated for shape; null-safe.
 * Audit logging via Edge Function when Supabase is configured.
 */

import { supabase } from '@/lib/supabase'
import type { AuthResponse, ChildProfile, ChildProfileInput, User } from '@/types/auth'
import { asArray } from '@/lib/data-guard'

const hasSupabase = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''

/** Log auth event to audit_logs via Edge Function. Fire-and-forget; never throws. */
async function logAuthEvent(
  accessToken: string | undefined,
  action: string,
  success: boolean,
  metadata?: Record<string, unknown>
): Promise<void> {
  if (!hasSupabase || !supabaseUrl || !accessToken) return
  try {
    await fetch(`${supabaseUrl}/functions/v1/log-auth-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ action, success, metadata: metadata ?? {} }),
    })
  } catch {
    // Fire-and-forget
  }
}

function toUser(user: { id: string; email?: string; user_metadata?: { name?: string }; created_at?: string }): User {
  const now = new Date().toISOString()
  return {
    id: user.id ?? '',
    name: user.user_metadata?.name ?? user.email ?? 'User',
    email: user.email ?? '',
    createdAt: user.created_at ?? now,
    updatedAt: now,
    authenticatedAt: now,
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  if (hasSupabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      await logAuthEvent(undefined, 'login', false, { email: email?.slice(0, 3) + '***' })
      throw new Error(error.message)
    }
    const user = data?.user
    const session = data?.session
    if (!user) throw new Error('Authentication failed')
    await logAuthEvent(session?.access_token, 'login', true, { provider: 'email' })
    return {
      user: toUser(user),
      onboardingRequired: false,
    }
  }
  // Mock for development
  await new Promise((r) => setTimeout(r, 600))
  return {
    user: {
      id: 'mock-user',
      name: 'Demo User',
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authenticatedAt: new Date().toISOString(),
    },
    onboardingRequired: false,
  }
}

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  if (hasSupabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) {
      await logAuthEvent(undefined, 'signup', false, { email: email?.slice(0, 3) + '***' })
      throw new Error(error.message)
    }
    const user = data?.user
    const session = data?.session
    if (!user) throw new Error('Signup failed')
    await logAuthEvent(session?.access_token, 'signup', true, { needsEmailVerification: !session })
    return {
      user: toUser(user),
      onboardingRequired: !!session,
      needsEmailVerification: !session,
    }
  }
  // Mock for development
  await new Promise((r) => setTimeout(r, 800))
  return {
    user: {
      id: 'mock-user-' + Date.now(),
      name,
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authenticatedAt: new Date().toISOString(),
    },
    onboardingRequired: true,
  }
}

export async function signInWithOAuth(provider: 'google' | 'apple' | 'facebook'): Promise<void> {
  if (hasSupabase) {
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : undefined
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider === 'facebook' ? 'facebook' : provider,
      options: { redirectTo },
    })
    if (error) throw new Error(error.message)
    return
  }
  throw new Error(`${provider} sign-in is not configured. Please set up Supabase.`)
}

/** Link an OAuth provider to the current account. User must be signed in. */
export async function linkOAuthProvider(provider: 'google' | 'apple' | 'facebook'): Promise<void> {
  if (hasSupabase) {
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback?returnTo=/dashboard/settings`
        : undefined
    const { error } = await supabase.auth.linkIdentity({
      provider: provider === 'facebook' ? 'facebook' : provider,
      options: { redirectTo },
    })
    if (error) throw new Error(error.message)
    return
  }
  throw new Error(`${provider} link is not configured.`)
}

/** Get linked OAuth providers for the current user. */
export async function getLinkedProviders(): Promise<string[]> {
  if (hasSupabase) {
    const { data: { user } } = await supabase.auth.getUser()
    const identities = user?.identities ?? []
    return identities.map((i) => i.provider ?? '').filter(Boolean)
  }
  return []
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean }> {
  if (hasSupabase) {
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/password-reset`
        : undefined
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })
    if (error) throw new Error(error.message)
    return { success: true }
  }
  await new Promise((r) => setTimeout(r, 600))
  return { success: true }
}

export async function updatePassword(newPassword: string): Promise<{ success: boolean }> {
  if (hasSupabase) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new Error(error.message)
    return { success: true }
  }
  await new Promise((r) => setTimeout(r, 500))
  return { success: true }
}

/** Check if current session is from a password recovery link (hash type=recovery). */
export function hasRecoverySession(): boolean {
  if (typeof window === 'undefined') return false
  const hash = window.location.hash ?? ''
  return hash.includes('type=recovery') && hash.includes('access_token')
}

export type VerificationStatus = 'pending' | 'verified' | 'error'

export interface VerificationStatusResponse {
  status: VerificationStatus
  email?: string
  message?: string
}

export interface ResendVerificationResponse {
  success: boolean
  message?: string
  cooldown?: number
}

export async function postResendVerification(email: string): Promise<ResendVerificationResponse> {
  if (hasSupabase) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
    })
    if (error) throw new Error(error.message)
    return { success: true, message: 'Verification email sent' }
  }
  await new Promise((r) => setTimeout(r, 500))
  return { success: true, message: 'Verification email sent' }
}

export async function signOut(): Promise<void> {
  if (hasSupabase) {
    const { data: { session } } = await supabase.auth.getSession()
    await logAuthEvent(session?.access_token, 'logout', true)
    await supabase.auth.signOut()
  }
}

export async function getVerificationStatus(): Promise<VerificationStatusResponse> {
  if (hasSupabase) {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      return { status: 'error', message: error.message }
    }
    const email = user?.email ?? ''
    const isVerified = Boolean(user?.email_confirmed_at)
    return {
      status: isVerified ? 'verified' : 'pending',
      email,
    }
  }
  await new Promise((r) => setTimeout(r, 300))
  return { status: 'pending', email: '' }
}

type ChildProfileRow = {
  id?: string
  user_id?: string
  name?: string
  age?: number
  grade?: string
  learning_preferences?: string[] | null
  created_at?: string
}

function toChildProfile(row: ChildProfileRow): ChildProfile {
  return {
    id: row.id ?? '',
    userId: row.user_id ?? '',
    name: row.name ?? '',
    age: row.age ?? 0,
    grade: row.grade ?? '',
    learningPreferences: Array.isArray(row.learning_preferences) ? row.learning_preferences : [],
    createdAt: row.created_at,
  }
}

export async function getOnboardingChildren(): Promise<ChildProfile[]> {
  if (hasSupabase) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data, error } = await supabase
      .from('child_profiles')
      .select('*')
      .eq('user_id', user.id)
    if (error) return []
    const rows = asArray<ChildProfileRow>(data)
    return rows.map(toChildProfile)
  }
  return []
}

export async function saveOnboardingChildren(
  profiles: (ChildProfile | ChildProfileInput)[]
): Promise<{ success: boolean; updatedChildren: ChildProfile[] }> {
  const safeProfiles = profiles ?? []
  if (hasSupabase) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const insertRows = safeProfiles.map((p) => ({
      user_id: user.id,
      name: p.name,
      age: p.age,
      grade: p.grade,
      learning_preferences: Array.isArray(p.learningPreferences) ? p.learningPreferences : [],
    }))
    const { data, error } = await supabase.from('child_profiles').upsert(insertRows).select()
    if (error) throw new Error(error.message)
    const rawRows = asArray<ChildProfileRow>(data)
    const list = rawRows.map(toChildProfile)
    return { success: true, updatedChildren: list }
  }
  await new Promise((r) => setTimeout(r, 500))
  return {
    success: true,
    updatedChildren: safeProfiles.map((p, i) => ({
      id: 'id' in p && p.id ? p.id : `mock-${i}`,
      userId: 'userId' in p && p.userId ? p.userId : 'mock-user',
      name: p.name,
      age: p.age,
      grade: p.grade,
      learningPreferences: Array.isArray(p.learningPreferences) ? p.learningPreferences : [],
    })),
  }
}
