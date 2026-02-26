/**
 * Supabase Edge Function: search-facets
 * Filter facets with counts for child, subject, style, date.
 * GET /functions/v1/search-facets
 * Returns: { facets: { children, subjects, styles, dates }, counts }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DEFAULT_SUBJECTS = ['Math', 'Reading', 'Science', 'History', 'English', 'Social Studies']
const DEFAULT_STYLES = ['playful', 'visual', 'kinesthetic', 'auditory', 'reading']

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

    const children: string[] = []
    const subjects = [...DEFAULT_SUBJECTS]
    const styles = [...DEFAULT_STYLES]
    const dates: string[] = ['Last 7 days', 'Last 30 days', 'Last 90 days']
    const counts: Record<string, number> = {}

    if (user) {
      const { data: childRows } = await supabase
        .from('child_profiles')
        .select('id, name')
        .eq('user_id', user.id)
      const childList = Array.isArray(childRows) ? childRows : []
      for (const c of childList) {
        if (c.name) children.push(c.name)
      }

      const { data: studyRows } = await supabase
        .from('studies')
        .select('subject, learning_style, created_at')
        .eq('user_id', user.id)
        .eq('is_deleted', false)

      const studyList = Array.isArray(studyRows) ? studyRows : []
      const subjectSet = new Set<string>()
      const styleSet = new Set<string>()
      for (const s of studyList) {
        if (s.subject) subjectSet.add(String(s.subject))
        if (s.learning_style) styleSet.add(String(s.learning_style))
      }
      subjectSet.forEach((s) => {
        if (!subjects.includes(s)) subjects.push(s)
      })
      styleSet.forEach((s) => {
        if (!styles.includes(s)) styles.push(s)
      })

      counts.studies = studyList.length
      counts.children = childList.length
    }

    return new Response(
      JSON.stringify({
        facets: { children, subjects, styles, dates },
        counts,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
