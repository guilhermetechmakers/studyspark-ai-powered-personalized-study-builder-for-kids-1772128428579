/**
 * Supabase Edge Function: search
 * Unified search across studies, materials, and help docs.
 * POST /functions/v1/search
 * Body: { query, filters, page, limit, sort? }
 * Returns: { data: ResultItem[], total: number }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const HELP_DOCS = [
  { id: 'help-1', title: 'Getting Started with StudySpark', snippet: 'Learn how to create your first study set, add materials, and generate personalized content.', url: '/about-help#about' },
  { id: 'help-2', title: 'Creating Study Sets', snippet: 'Step-by-step guide to creating study sets from uploaded materials or scratch.', url: '/about-help#help-center' },
  { id: 'help-3', title: 'Library Organization', snippet: 'Organize studies with folders, tags, and bulk actions.', url: '/dashboard/studies' },
  { id: 'help-4', title: 'Export and Print', snippet: 'Export studies to PDF or print for offline use.', url: '/dashboard/export' },
  { id: 'help-5', title: 'Child Profiles', snippet: 'Set up child profiles for age-appropriate content and learning styles.', url: '/dashboard/children' },
  { id: 'help-6', title: 'Analytics and Progress', snippet: 'Track learning progress and engagement with analytics.', url: '/dashboard/analytics' },
]

function toResultItem(
  row: Record<string, unknown>,
  type: 'study' | 'material',
  snippet: string,
  ownerId: string
): Record<string, unknown> {
  const id = String(row.id ?? '')
  const title = String(row.title ?? row.topic ?? row.name ?? 'Untitled')
  const createdAt = String(row.created_at ?? '')
  const updatedAt = String(row.updated_at ?? row.created_at ?? '')
  return {
    id,
    type,
    title,
    snippet,
    ownerId,
    sharedWith: [],
    subject: row.subject ? String(row.subject) : null,
    childAgeGroup: row.age ? String(row.age) : null,
    style: row.learning_style ? String(row.learning_style) : null,
    createdAt,
    updatedAt,
    isStarred: false,
    url: type === 'study' ? `/dashboard/studies/${id}` : undefined,
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: authHeader ? { Authorization: authHeader } : {} } }
    )

    const { data: { user } } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') ?? ''
    )

    const body = await req.json().catch(() => ({}))
    const query = String(body?.query ?? '').trim()
    const filters = (body?.filters ?? {}) as Record<string, unknown>
    const page = Math.max(1, Number(body?.page) ?? 1)
    const limit = Math.min(50, Math.max(1, Number(body?.limit) ?? 20))
    const types = (filters?.types as string[] | undefined) ?? ['study', 'material', 'help']

    const results: Record<string, unknown>[] = []

    if (user && (types.includes('study') || types.includes('material'))) {
      let studiesQuery = supabase
        .from('studies')
        .select('id, topic, title, subject, learning_style, age, child_profile_id, description, created_at, updated_at', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('is_deleted', false)

      if (query) {
        studiesQuery = studiesQuery.or(
          `topic.ilike.%${query}%,title.ilike.%${query}%,description.ilike.%${query}%,subject.ilike.%${query}%`
        )
      }
      if (filters?.subject && Array.isArray(filters.subject) && filters.subject.length > 0) {
        studiesQuery = studiesQuery.in('subject', filters.subject)
      }
      if (filters?.style && Array.isArray(filters.style) && filters.style.length > 0) {
        studiesQuery = studiesQuery.in('learning_style', filters.style)
      }
      if (filters?.dateFrom) {
        studiesQuery = studiesQuery.gte('created_at', filters.dateFrom)
      }
      if (filters?.dateTo) {
        studiesQuery = studiesQuery.lte('created_at', filters.dateTo)
      }

      studiesQuery = studiesQuery.order('updated_at', { ascending: false })

      const { data: studyRows } = await studiesQuery.limit(500)

      const studyList = Array.isArray(studyRows) ? studyRows : []
      if (types.includes('study')) {
        for (const r of studyList) {
          const desc = String(r.description ?? r.topic ?? '').slice(0, 120)
          results.push(toResultItem(r, 'study', desc || 'Study set', user.id))
        }
      }

      if (types.includes('material') && studyList.length > 0) {
        const studyIds = studyList.map((s) => s.id).filter(Boolean)
        const { data: matRows } = await supabase
          .from('materials')
          .select('id, name, study_id, created_at')
          .in('study_id', studyIds)

        const matList = Array.isArray(matRows) ? matRows : []
        const q = query.toLowerCase()
        const filtered = q
          ? matList.filter((m) => String(m.name ?? '').toLowerCase().includes(q))
          : matList
        for (const m of filtered) {
          results.push(
            toResultItem(
              { ...m, title: m.name ?? 'Material', updated_at: m.created_at },
              'material',
              String(m.name ?? 'Uploaded material'),
              user.id
            )
          )
        }
      }
    }

    if (types.includes('help')) {
      const q = query.toLowerCase()
      const helpFiltered = q
        ? HELP_DOCS.filter(
            (h) =>
              h.title.toLowerCase().includes(q) || h.snippet.toLowerCase().includes(q)
          )
        : HELP_DOCS
      for (const h of helpFiltered) {
        results.push({
          id: h.id,
          type: 'help',
          title: h.title,
          snippet: h.snippet,
          ownerId: '',
          sharedWith: [],
          subject: null,
          childAgeGroup: null,
          style: null,
          createdAt: '',
          updatedAt: '',
          url: h.url,
        })
      }
    }

    const total = results.length
    const start = (page - 1) * limit
    const paginated = results.slice(start, start + limit)

    return new Response(
      JSON.stringify({ data: paginated, total: total }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
