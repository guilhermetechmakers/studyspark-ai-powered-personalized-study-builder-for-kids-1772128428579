/**
 * Profiles API - User and Child profile CRUD via Supabase.
 * Includes audit logging, export (CSV/JSON), and privacy deletion.
 * All responses validated with safe defaults; guards against null/undefined.
 */

import { supabase } from '@/lib/supabase'
import type { UserProfile, ChildProfileData, ProfileAuditLogEntry } from '@/types/profile'
import { VALID_LEARNING_PREFERENCES, VALID_GRADES } from '@/types/profile'

/** Map Supabase user_profiles row to UserProfile */
function mapUserProfile(row: Record<string, unknown>): UserProfile {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    phone: typeof row.phone === 'string' ? row.phone : undefined,
    address: typeof row.address === 'string' ? row.address : undefined,
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  }
}

/** Map Supabase child_profiles row to ChildProfileData */
function mapChildProfile(row: Record<string, unknown>): ChildProfileData {
  const prefs = row.learning_preferences
  const prefsArr = Array.isArray(prefs) ? prefs : []
  const learningPreferences = prefsArr
    .filter((p): p is string => typeof p === 'string')
    .filter((p) => VALID_LEARNING_PREFERENCES.includes(p as string))

  return {
    id: String(row.id ?? ''),
    userId: String(row.user_id ?? ''),
    name: String(row.name ?? ''),
    age: Number(row.age ?? 0),
    grade: String(row.grade ?? ''),
    learningPreferences: learningPreferences.length > 0 ? learningPreferences : ['Playful'],
    createdAt: typeof row.created_at === 'string' ? row.created_at : undefined,
    updatedAt: typeof row.updated_at === 'string' ? row.updated_at : undefined,
  }
}

/** Insert audit log entry */
async function insertAuditLog(
  userId: string,
  action: string,
  targetType: 'user' | 'child',
  targetId: string | null,
  changedBy: string,
  changes: Record<string, unknown>
): Promise<void> {
  await supabase.from('profile_audit_log').insert({
    user_id: userId,
    action,
    target_id: targetId,
    target_type: targetType,
    changed_by: changedBy,
    changes,
  })
}

/** Get current user profile */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return mapUserProfile(data as Record<string, unknown>)
}

/** Create or update user profile */
export async function upsertUserProfile(
  userId: string,
  payload: { name?: string; email?: string; phone?: string; address?: string },
  changedBy: string
): Promise<UserProfile | null> {
  const existing = await fetchUserProfile(userId)
  const before = existing ? { name: existing.name, email: existing.email, phone: existing.phone, address: existing.address } : {}

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        name: payload.name ?? existing?.name ?? '',
        email: payload.email ?? existing?.email ?? '',
        phone: payload.phone ?? existing?.phone ?? null,
        address: payload.address ?? existing?.address ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select()
    .single()

  if (error || !data) return null

  const after = { name: data.name, email: data.email, phone: data.phone, address: data.address }
  await insertAuditLog(userId, existing ? 'update_user' : 'create_user', 'user', userId, changedBy, { before, after })

  return mapUserProfile(data as Record<string, unknown>)
}

/** List child profiles for user */
export async function fetchChildProfiles(userId: string): Promise<ChildProfileData[]> {
  const { data, error } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) return []
  const rows = Array.isArray(data) ? data : []
  return rows.map((r) => mapChildProfile(r as Record<string, unknown>))
}

/** Create child profile */
export async function createChildProfile(
  userId: string,
  payload: { name: string; age: number; grade: string; learningPreferences: string[] },
  changedBy: string
): Promise<ChildProfileData | null> {
  const prefs = (payload.learningPreferences ?? []).filter((p) =>
    VALID_LEARNING_PREFERENCES.includes(p as string)
  )
  const learningPreferences = prefs.length > 0 ? prefs : ['Playful']

  const { data, error } = await supabase
    .from('child_profiles')
    .insert({
      user_id: userId,
      name: payload.name.trim(),
      age: Math.min(18, Math.max(4, payload.age)),
      grade: VALID_GRADES.includes(payload.grade as string) ? payload.grade : 'K',
      learning_preferences: learningPreferences,
    })
    .select()
    .single()

  if (error || !data) return null

  await insertAuditLog(userId, 'create_child', 'child', data.id, changedBy, {
    after: { name: data.name, age: data.age, grade: data.grade, learning_preferences: data.learning_preferences },
  })

  return mapChildProfile(data as Record<string, unknown>)
}

/** Update child profile */
export async function updateChildProfile(
  userId: string,
  childId: string,
  payload: Partial<{ name: string; age: number; grade: string; learningPreferences: string[] }>,
  changedBy: string
): Promise<ChildProfileData | null> {
  const existing = await supabase
    .from('child_profiles')
    .select('*')
    .eq('id', childId)
    .eq('user_id', userId)
    .single()

  if (existing.error || !existing.data) return null

  const before = existing.data as Record<string, unknown>
  const prefs = payload.learningPreferences
  const learningPreferences =
    prefs && prefs.length > 0
      ? prefs.filter((p) => VALID_LEARNING_PREFERENCES.includes(p as string))
      : (before.learning_preferences as string[]) ?? []

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (payload.name !== undefined) update.name = payload.name.trim()
  if (payload.age !== undefined) update.age = Math.min(18, Math.max(4, payload.age))
  if (payload.grade !== undefined) update.grade = VALID_GRADES.includes(payload.grade) ? payload.grade : before.grade
  if (payload.learningPreferences !== undefined) update.learning_preferences = learningPreferences

  const { data, error } = await supabase
    .from('child_profiles')
    .update(update)
    .eq('id', childId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !data) return null

  await insertAuditLog(userId, 'update_child', 'child', childId, changedBy, {
    before: { name: before.name, age: before.age, grade: before.grade, learning_preferences: before.learning_preferences },
    after: { name: data.name, age: data.age, grade: data.grade, learning_preferences: data.learning_preferences },
  })

  return mapChildProfile(data as Record<string, unknown>)
}

/** Delete child profile */
export async function deleteChildProfile(
  userId: string,
  childId: string,
  changedBy: string
): Promise<boolean> {
  const existing = await supabase
    .from('child_profiles')
    .select('*')
    .eq('id', childId)
    .eq('user_id', userId)
    .single()

  if (existing.error || !existing.data) return false

  const { error } = await supabase
    .from('child_profiles')
    .delete()
    .eq('id', childId)
    .eq('user_id', userId)

  if (error) return false

  await insertAuditLog(userId, 'delete_child', 'child', childId, changedBy, {
    before: existing.data as Record<string, unknown>,
  })

  return true
}

/** Fetch audit log entries */
export async function fetchAuditLog(
  userId: string,
  options?: { targetId?: string; targetType?: 'user' | 'child'; limit?: number }
): Promise<ProfileAuditLogEntry[]> {
  let q = supabase
    .from('profile_audit_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(options?.limit ?? 50)

  if (options?.targetId) q = q.eq('target_id', options.targetId)
  if (options?.targetType) q = q.eq('target_type', options.targetType)

  const { data, error } = await q

  if (error) return []
  const rows = Array.isArray(data) ? data : []
  return rows.map((r) => {
    const row = r as Record<string, unknown>
    return {
      id: String(row.id ?? ''),
      userId: String(row.user_id ?? ''),
      action: String(row.action ?? ''),
      targetId: typeof row.target_id === 'string' ? row.target_id : undefined,
      targetType: (row.target_type as 'user' | 'child') ?? 'user',
      changedBy: String(row.changed_by ?? ''),
      changes: (row.changes as Record<string, unknown>) ?? {},
      createdAt: String(row.created_at ?? ''),
    }
  })
}

/** Export user data as JSON */
export async function exportUserDataJson(userId: string): Promise<string> {
  const [profile, children] = await Promise.all([
    fetchUserProfile(userId),
    fetchChildProfiles(userId),
  ])

  const user = profile ?? {
    id: userId,
    name: '',
    email: '',
    createdAt: '',
    updatedAt: '',
  }

  const data = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    children: (children ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      age: c.age,
      grade: c.grade,
      learningPreferences: c.learningPreferences,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
  }

  return JSON.stringify(data, null, 2)
}

/** Export user data as CSV */
export function exportUserDataCsv(
  user: UserProfile,
  children: ChildProfileData[]
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

  const rows: string[][] = []

  if ((children ?? []).length === 0) {
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
    for (const c of children ?? []) {
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

  const lines = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))]
  return lines.join('\n')
}
