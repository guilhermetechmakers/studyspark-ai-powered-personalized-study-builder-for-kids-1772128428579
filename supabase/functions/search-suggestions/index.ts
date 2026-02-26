/**
 * Supabase Edge Function: search-suggestions
 * Autocomplete suggestions: recent queries, trending topics, contextual completions.
 * GET /functions/v1/search-suggestions?query=...
 * Returns: { suggestions: SuggestionItem[], recentlyUsed?: string[] }
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TRENDING_TOPICS = [
  'math',
  'reading',
  'science',
  'flashcards',
  'quiz',
  'vocabulary',
  'spelling',
  'history',
  'study set',
  'export',
]

const CONTEXTUAL_COMPLETIONS: Record<string, string[]> = {
  m: ['math', 'math flashcards', 'multiplication'],
  r: ['reading', 'reading comprehension'],
  s: ['science', 'spelling', 'study set', 'social studies'],
  f: ['flashcards', 'fractions'],
  q: ['quiz', 'questions'],
  v: ['vocabulary', 'verbs'],
  h: ['history', 'help'],
  e: ['export', 'english'],
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const query = String(url.searchParams.get('query') ?? '').trim().toLowerCase()

    const suggestions: { text: string; type: string }[] = []

    if (query.length > 0) {
      const first = query[0]
      const completions = CONTEXTUAL_COMPLETIONS[first] ?? []
      for (const c of completions) {
        if (c.startsWith(query) || query.includes(c.split(' ')[0] ?? '')) {
          suggestions.push({ text: c, type: 'query' })
        }
      }
      for (const t of TRENDING_TOPICS) {
        if (t.includes(query) && !suggestions.some((s) => s.text === t)) {
          suggestions.push({ text: t, type: 'topic' })
        }
      }
    }

    for (const t of TRENDING_TOPICS.slice(0, 5)) {
      if (!suggestions.some((s) => s.text === t)) {
        suggestions.push({ text: t, type: 'topic' })
      }
    }

    const recentlyUsed: string[] = []
    try {
      const stored = localStorage
      if (typeof stored !== 'undefined') {
        const recent = (stored as unknown as Storage)?.getItem?.('search_recent')
        if (recent) {
          const parsed = JSON.parse(recent) as string[]
          recentlyUsed.push(...(Array.isArray(parsed) ? parsed : []))
        }
      }
    } catch {
      // ignore - localStorage not available in Edge
    }

    return new Response(
      JSON.stringify({ suggestions: suggestions.slice(0, 10), recentlyUsed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
