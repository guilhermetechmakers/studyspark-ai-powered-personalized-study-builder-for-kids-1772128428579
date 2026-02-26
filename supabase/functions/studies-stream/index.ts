/**
 * Supabase Edge Function: studies-stream
 * SSE stream for progressive AI generation output.
 * GET /functions/v1/studies-stream?studyId=xxx
 * Streams NDJSON chunks: { type, progressPct?, stage?, block? }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MOCK_BLOCKS = [
  { type: 'text' as const, content: '## Overview\n\nThis study set covers the key concepts. Let\'s get started!', order: 0 },
  { type: 'list' as const, content: '- Key point 1\n- Key point 2\n- Key point 3', order: 1 },
  { type: 'text' as const, content: '## Key Concepts\n\nReview these concepts before moving to practice.', order: 2 },
]

function sseLine(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`
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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const userClient = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { user } } = await userClient.auth.getUser(token)
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const studyId = url.searchParams.get('studyId') ?? ''
    if (!studyId) {
      return new Response(
        JSON.stringify({ error: 'studyId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey)
    const { data: study } = await adminClient.from('studies').select('id, user_id, topic').eq('id', studyId).single()

    if (!study || (study.user_id as string) !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Study not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const topic = (study.topic as string) ?? 'Study'
    const blocks = MOCK_BLOCKS.map((b) => ({
      ...b,
      content: b.content.replace('Overview', `${topic} Overview`).replace('Key Concepts', `${topic} Key Concepts`),
    }))

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        const send = (data: unknown) => controller.enqueue(encoder.encode(sseLine(data)))

        send({ type: 'progress', stage: 'starting', progressPct: 0 })

        for (let i = 0; i < blocks.length; i++) {
          await new Promise((r) => setTimeout(r, 600))
          const pct = Math.round(((i + 1) / (blocks.length + 1)) * 100)
          send({ type: 'progress', stage: 'generating', progressPct: pct })
          send({ type: 'block', block: blocks[i] })
        }

        send({ type: 'progress', stage: 'complete', progressPct: 100 })
        send({ type: 'complete' })

        const payload = { blocks }
        await adminClient.from('drafts').insert({
          study_id: studyId,
          version: 1,
          content_payload: payload,
        })
        await adminClient.from('studies').update({ status: 'ready', updated_at: new Date().toISOString() }).eq('id', studyId)
        await adminClient.from('progress').upsert(
          { study_id: studyId, stage: 'complete', progress_pct: 100, updated_at: new Date().toISOString() },
          { onConflict: 'study_id' }
        )

        send('data: [DONE]\n\n')
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
