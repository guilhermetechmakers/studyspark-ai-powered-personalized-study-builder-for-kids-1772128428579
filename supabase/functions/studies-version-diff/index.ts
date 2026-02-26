/**
 * Supabase Edge Function: studies-version-diff
 * Computes block-level diff between a version and current blocks.
 * POST /functions/v1/studies-version-diff
 * Body: { studyId, versionId, currentBlocks? }
 * Returns: { diffs: BlockDiff[] }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getBlockContent(b: { content?: string | Record<string, unknown> }): string {
  const c = b?.content
  if (typeof c === 'string') return c
  return JSON.stringify(c ?? {})
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
    const studyId = (body?.studyId ?? '').toString()
    const versionId = (body?.versionId ?? '').toString()
    const currentBlocks = Array.isArray(body?.currentBlocks) ? body.currentBlocks : []

    if (!studyId || !versionId) {
      return new Response(
        JSON.stringify({ message: 'studyId and versionId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: study, error: studyErr } = await supabase
      .from('studies')
      .select('id')
      .eq('id', studyId)
      .eq('user_id', user.id)
      .single()

    if (studyErr || !study) {
      return new Response(
        JSON.stringify({ message: 'Study not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: version } = await supabase
      .from('versions')
      .select('content_snapshot')
      .eq('study_id', studyId)
      .eq('id', versionId)
      .single()

    let versionBlocks: { id?: string; content?: string | Record<string, unknown> }[] = []
    if (version?.content_snapshot) {
      const snap = version.content_snapshot as Record<string, unknown>
      versionBlocks = Array.isArray(snap.blocks) ? snap.blocks : Array.isArray(snap.lessons) ? snap.lessons : []
    }

    if (currentBlocks.length === 0) {
      const { data: draft } = await supabase
        .from('drafts')
        .select('content_payload')
        .eq('study_id', studyId)
        .single()
      const payload = (draft?.content_payload as Record<string, unknown>) ?? {}
      const blocks = Array.isArray((payload as { blocks?: unknown[] }).blocks)
        ? (payload as { blocks: unknown[] }).blocks
        : Array.isArray(payload.lessons)
          ? payload.lessons
          : []
      currentBlocks.push(...blocks)
    }

    const versionMap = new Map(versionBlocks.map((b) => [b?.id ?? '', b]))
    const currentMap = new Map(currentBlocks.map((b: { id?: string }) => [b?.id ?? '', b]))
    const allIds = new Set([...versionMap.keys(), ...currentMap.keys()].filter(Boolean])

    const diffs: { blockId: string; before: string; after: string; type: string }[] = []
    for (const id of allIds) {
      const v = versionMap.get(id)
      const c = currentMap.get(id)
      const before = v ? getBlockContent(v) : ''
      const after = c ? getBlockContent(c) : ''
      let type = 'unchanged'
      if (!v && c) type = 'added'
      else if (v && !c) type = 'removed'
      else if (before !== after) type = 'modified'
      diffs.push({ blockId: id, before, after, type })
    }

    return new Response(
      JSON.stringify({ diffs }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
