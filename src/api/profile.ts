/**
 * Profile & Child Profile API - Supabase-backed CRUD.
 * Uses Supabase client with RLS; audit trail via database triggers.
 * Supports profiles table; export (CSV/JSON) and audit log.
 */

import { supabase } from '@/lib/supabase'
import { asArray, dataGuard } from '@/lib/data-guard'
import {
  VALID_GRADES,
  VALID_LEARNING_PREFERENCES,
  type UserProfile,
  type ChildProfile,
  type ChildProfileInput,
  type ProfileAuditLog,
} from '@/types/profile'

const hasSupabase = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
)

type ProfileRow = {
  id?: string
  name?: string
  email?: string
  phone?: string
  address?: string
  created_at?: string
  updated_at?: string
}

type ChildProfileRow = {
  id?: string
  user_id?: string
  name?: string
  age?: number
  grade?: string
  learning_preferences?: string[] | null
  created_at?: string
  updated_at?: string
}

function toUserProfile(row: ProfileRow | null): UserProfile | null {
  if (!row || typeof row.id !== 'string') return null
  return {
    id: row.id,
    name: row.name ?? '',
    email: row.email ?? '',
    phone: typeof row.phone === 'string' ? row.phone : undefined,
    address: typeof row.address === 'string' ? row.address : undefined,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
  }
}

function toChildProfile(row: ChildProfileRow | null): ChildProfile | null {
  if (!row || typeof row.id !== 'string' || typeof row.name !== 'string') return null
  const prefs = Array.isArray(row.learning_preferences) ? row.learning_preferences : []
  const validPrefs = prefs.filter((p) =>
    VALID_LEARNING_PREFERENCES.includes(p as string)
  )
  return {
    id: row.id,
    userId: row.user_id ?? '',
    name: row.name,
    age: typeof row.age === 'number' ? Math.min(18, Math.max(4, row.age)) : 0,
    grade: typeof row.grade === 'string' && VALID_GRADES.includes(row.grade) ? row.grade : 'K',
    learningPreferences: validPrefs.length > 0 ? validPrefs : ['Playful'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchUserProfile(): Promise<UserProfile | null> {
  if (!hasSupabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  if (error) {
    return {
      id: user.id,
      name: user.user_metadata?.name ?? user.email ?? 'User',
      email: user.email ?? '',
      createdAt: user.created_at ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
  return toUserProfile(data as ProfileRow)
}

export async function updateUserProfile(payload: {
  name?: string
  email?: string
  phone?: string
  address?: string
}): Promise<UserProfile | null> {
  if (!hasSupabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (payload.name !== undefined) updates.name = payload.name
  if (payload.email !== undefined) updates.email = payload.email
  if (payload.phone !== undefined) updates.phone = payload.phone
  if (payload.address !== undefined) updates.address = payload.address
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()
  if (error) return null
  return toUserProfile(data as ProfileRow)
}

export async function fetchChildProfiles(): Promise<ChildProfile[]> {
  if (!hasSupabase) return []
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) return []
  const rows = asArray<ChildProfileRow>(data)
  return rows
    .map((r) => toChildProfile(r))
    .filter((c): c is ChildProfile => c !== null)
}

export async function createChildProfile(
  payload: ChildProfileInput
): Promise<ChildProfile | null> {
  if (!hasSupabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('child_profiles')
    .insert({
      user_id: user.id,
      name: payload.name.trim(),
      age: Math.min(18, Math.max(4, payload.age)),
      grade: payload.grade,
      learning_preferences: dataGuard(payload.learningPreferences),
    })
    .select()
    .single()
  if (error) return null
  return toChildProfile(data as ChildProfileRow)
}

export async function updateChildProfile(
  id: string,
  payload: Partial<ChildProfileInput>
): Promise<ChildProfile | null> {
  if (!hasSupabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (payload.name !== undefined) updates.name = payload.name.trim()
  if (payload.age !== undefined) updates.age = Math.min(18, Math.max(4, payload.age))
  if (payload.grade !== undefined) updates.grade = payload.grade
  if (payload.learningPreferences !== undefined)
    updates.learning_preferences = dataGuard(payload.learningPreferences)
  const { data, error } = await supabase
    .from('child_profiles')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()
  if (error) return null
  return toChildProfile(data as ChildProfileRow)
}

export async function deleteChildProfile(id: string): Promise<boolean> {
  if (!hasSupabase) return false
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { error } = await supabase
    .from('child_profiles')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  return !error
}

export async function fetchProfileAuditLog(options?: {
  targetId?: string
  targetType?: 'user' | 'child'
  limit?: number
}): Promise<ProfileAuditLog[]> {
  if (!hasSupabase) return []
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  let query = supabase
    .from('profile_audit_log')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(options?.limit ?? 100)
  if (options?.targetId) query = query.eq('target_id', options.targetId)
  if (options?.targetType) query = query.eq('target_type', options.targetType)
  const { data, error } = await query
  if (error) return []
  const rows = asArray<Record<string, unknown>>(data)
  return rows.map((r) => ({
    id: String(r.id ?? ''),
    userId: String(r.user_id ?? ''),
    action: String(r.action ?? ''),
    targetId: r.target_id ? String(r.target_id) : undefined,
    targetType: (r.target_type as 'user' | 'child') ?? 'user',
    changedBy: r.changed_by ? String(r.changed_by) : undefined,
    changes: (r.changes as Record<string, unknown>) ?? undefined,
    createdAt: String(r.created_at ?? ''),
  }))
}

/** Export user data as JSON */
export async function exportUserDataJson(): Promise<string> {
  if (!hasSupabase) return JSON.stringify({ user: {}, children: [] }, null, 2)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return JSON.stringify({ user: {}, children: [] }, null, 2)
  const [profile, children] = await Promise.all([
    fetchUserProfile(),
    fetchChildProfiles(),
  ])
  const userData: UserProfile = profile ?? {
    id: user.id,
    name: user.user_metadata?.name ?? user.email ?? 'User',
    email: user.email ?? '',
    phone: undefined,
    address: undefined,
    createdAt: user.created_at ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const safeChildren = dataGuard(children)
  return JSON.stringify(
    {
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
      children: safeChildren.map((c) => ({
        id: c.id,
        name: c.name,
        age: c.age,
        grade: c.grade,
        learningPreferences: c.learningPreferences ?? [],
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    },
    null,
    2
  )
}

/** Export user data as CSV */
export function exportUserDataCsv(
  user: UserProfile,
  children: ChildProfile[]
): string {
  const headers = [
    'user_id',
    'user_name',
    'user_email',
    'user_phone',
    'child_id',
    'child_name',
    'child_age',
    'child_grade',
    'child_learning_preferences',
  ]
  const safeChildren = dataGuard(children)
  const rows: string[][] = []
  if (safeChildren.length === 0) {
    rows.push([
      user.id,
      user.name,
      user.email,
      user.phone ?? '',
      '',
      '',
      '',
      '',
      '',
    ])
  } else {
    for (const c of safeChildren) {
      rows.push([
        user.id,
        user.name,
        user.email,
        user.phone ?? '',
        c.id,
        c.name,
        String(c.age),
        c.grade,
        (c.learningPreferences ?? []).join(';'),
      ])
    }
  }
  const escape = (s: string) => {
    const str = String(s ?? '')
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }
  return [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n')
}
