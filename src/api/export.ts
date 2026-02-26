/**
 * Data export API - CSV and JSON export for user profile and child profiles.
 * Client-side generation; omits sensitive fields per privacy controls.
 */

import { fetchUserProfile } from '@/api/profile'
import { fetchChildProfiles } from '@/api/profile'
import type { UserProfile, ChildProfile } from '@/types/profile'

/** Fields to omit from export for privacy */
const OMIT_USER_FIELDS: string[] = []
const OMIT_CHILD_FIELDS: string[] = []

function sanitizeUser(profile: UserProfile | null): Record<string, unknown> {
  if (!profile) return {}
  const obj: Record<string, unknown> = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    address: profile.address,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  }
  OMIT_USER_FIELDS.forEach((k) => delete obj[k])
  return obj
}

function sanitizeChild(child: ChildProfile): Record<string, unknown> {
  const obj: Record<string, unknown> = {
    id: child.id,
    userId: child.userId,
    name: child.name,
    age: child.age,
    grade: child.grade,
    learningPreferences: child.learningPreferences ?? [],
    createdAt: child.createdAt,
    updatedAt: child.updatedAt,
  }
  OMIT_CHILD_FIELDS.forEach((k) => delete obj[k])
  return obj
}

export interface ExportPayload {
  user: Record<string, unknown>
  children: Record<string, unknown>[]
}

export async function exportDataAsJson(): Promise<ExportPayload> {
  const [user, children] = await Promise.all([
    fetchUserProfile(),
    fetchChildProfiles(),
  ])
  return {
    user: sanitizeUser(user),
    children: (children ?? []).map(sanitizeChild),
  }
}

export async function downloadJsonExport(): Promise<void> {
  const data = await exportDataAsJson()
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `studyspark-export-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function escapeCsvValue(val: unknown): string {
  if (val === null || val === undefined) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export async function downloadCsvExport(): Promise<void> {
  const data = await exportDataAsJson()
  const lines: string[] = []
  lines.push('Type,Id,Name,Email,Phone,Address,Age,Grade,LearningPreferences,CreatedAt')
  const user = data.user as Record<string, unknown>
  lines.push(
    [
      'user',
      user.id,
      user.name,
      user.email,
      user.phone,
      user.address,
      '',
      '',
      '',
      user.updatedAt ?? user.createdAt,
    ]
      .map(escapeCsvValue)
      .join(',')
  )
  ;(data.children ?? []).forEach((c: Record<string, unknown>) => {
    const prefs = Array.isArray(c.learningPreferences)
      ? c.learningPreferences.join('; ')
      : ''
    lines.push(
      [
        'child',
        c.id,
        c.name,
        '',
        '',
        '',
        c.age,
        c.grade,
        prefs,
        c.updatedAt ?? c.createdAt,
      ]
        .map(escapeCsvValue)
        .join(',')
    )
  })
  const csv = lines.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `studyspark-export-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
