/**
 * Supabase Edge Function: studies-prepare
 * Prepares study context for AI generation.
 * POST /functions/v1/studies-prepare
 * Body: { topic, topicTags?, contextNotes?, childProfileId?, childAge?, learningStyle, materials? }
 * Returns: { studyId, contextBlocks, topicTags, ready }
 * Requires: Supabase Auth (JWT)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    if (!authHeader) {
      return new Response(
        JSON.stringify({ message: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json().catch(() => ({}))
    const topic = (body?.topic ?? '').toString().trim()
    const learningStyle = (body?.learningStyle ?? 'playful').toString()
    const materials = Array.isArray(body?.materials) ? body.materials : []
    const childProfile = body?.childProfile ?? body?.childProfileId
    const age = typeof childProfile?.age === 'number' ? childProfile.age : (typeof body?.childAge === 'number' ? body.childAge : 8)

    if (!topic) {
      return new Response(
        JSON.stringify({ message: 'Topic is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let studyId = body?.studyId ?? null

    if (!studyId) {
      const { data: inserted, error: insertErr } = await supabase
        .from('studies')
        .insert({
          user_id: user.id,
          child_profile_id: childProfile?.id ?? body?.childProfileId ?? null,
          topic,
          subject: body?.subject ?? '',
          context_notes: body?.contextNotes ?? null,
          learning_style: learningStyle,
          age: Math.min(18, Math.max(4, age)),
          topic_tags: Array.isArray(body?.topicTags) ? body.topicTags : [],
          folders_path: [],
          status: 'draft',
        })
        .select('id')
        .single()
      if (!insertErr && inserted?.id) studyId = inserted.id
    }

    const contextBlocks: string[] = []
    contextBlocks.push(`Topic: ${topic}`)
    contextBlocks.push(`Learning style: ${learningStyle}`)

    if (body?.contextNotes && typeof body.contextNotes === 'string') {
      contextBlocks.push(`Teacher notes: ${body.contextNotes.trim()}`)
    }

    contextBlocks.push(`Target age: ${age}`)

    const topicTags = Array.isArray(body?.topicTags) ? body.topicTags : []
    const inferredTags = topic.split(/\s+/).filter((w: string) => w.length > 2).slice(0, 5)
    const allTags = [...new Set([...topicTags, ...inferredTags])].slice(0, 10)

    for (const m of materials) {
      if (m?.metadata?.text) {
        contextBlocks.push(`Material (text): ${m.metadata.text}`)
      }
      if (m?.metadata?.summary) {
        contextBlocks.push(`Material summary: ${m.metadata.summary}`)
      }
    }

    const studyId = body?.studyId ?? null
    if (studyId) {
      const { data: study } = await supabase
        .from('studies')
        .select('id')
        .eq('id', studyId)
        .eq('user_id', user.id)
        .single()

      if (study) {
        const { data: mats } = await supabase
          .from('materials')
          .select('id, type, metadata')
          .eq('study_id', studyId)

        const matsList = Array.isArray(mats) ? mats : []
        for (const mat of matsList) {
          const meta = (mat?.metadata as Record<string, unknown>) ?? {}
          if (meta.text) contextBlocks.push(`Uploaded note: ${String(meta.text)}`)
          if (meta.summary) contextBlocks.push(`Uploaded summary: ${String(meta.summary)}`)
        }
      }
    }

    return new Response(
      JSON.stringify({
        studyId: studyId ?? '',
        contextBlocks: contextBlocks.map((c, i) => ({ id: `ctx-${i}`, type: 'text', content: c })),
        topicTags: allTags,
        ready: contextBlocks.length > 0,
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
