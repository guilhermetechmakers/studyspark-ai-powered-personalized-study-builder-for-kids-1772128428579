/**
 * Supabase Edge Function: moderate
 * Content moderation / safety checks for study content.
 * POST /functions/v1/moderate
 * Body: { blocks: { type: string, content: string }[] }
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '') ?? ''
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    const userClient = await import('https://esm.sh/@supabase/supabase-js@2').then((m) =>
      m.createClient(supabaseUrl, supabaseAnonKey)
    )
    const { data: { user } } = await userClient.auth.getUser(token)
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = (await req.json().catch(() => ({}))) as { blocks?: { type: string; content: string }[] }
    const blocks = Array.isArray(body.blocks) ? body.blocks : []

    const issues: { type: string; message: string }[] = []
    const blockedTerms = ['inappropriate', 'violence', 'explicit']
    for (const block of blocks) {
      const content = (block?.content ?? '').toLowerCase()
      for (const term of blockedTerms) {
        if (content.includes(term)) {
          issues.push({ type: 'content', message: `Flagged term: ${term}` })
        }
      }
    }

    const status = issues.length > 0 ? 'flagged' : 'passed'

    return new Response(
      JSON.stringify({ status, issues }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
