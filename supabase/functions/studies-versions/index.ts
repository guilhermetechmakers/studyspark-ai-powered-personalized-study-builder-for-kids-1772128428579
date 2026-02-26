/**
 * Supabase Edge Function: studies-versions
 * Version history for studies. GET: list versions. POST: create version.
 * GET /functions/v1/studies-versions?studyId=...
 * POST /functions/v1/studies-versions Body: { studyId }
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

    const url = new URL(req.url)
    const studyId = url.searchParams.get('studyId') ?? ''
    const versionId = url.searchParams.get('versionId')

    if (!studyId) {
      return new Response(
        JSON.stringify({ message: 'studyId required' }),
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

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}))
      const sid = (body?.studyId ?? studyId).toString()

      const { data: draft } = await supabase
        .from('drafts')
        .select('content_payload, version')
        .eq('study_id', sid)
        .single()

      const contentSnapshot = (draft?.content_payload as Record<string, unknown>) ?? {}
      const versionNumber = (draft?.version as number) ?? 1

      const { data: inserted, error: insertErr } = await supabase
        .from('versions')
        .insert({
          study_id: sid,
          version_number: versionNumber,
          content_snapshot: contentSnapshot,
          diffs: {},
        })
        .select('id, study_id, version_number, created_at')
        .single()

      if (insertErr) {
        return new Response(
          JSON.stringify({ message: insertErr.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          id: inserted?.id,
          studyId: inserted?.study_id ?? sid,
          versionNumber: inserted?.version_number ?? versionNumber,
          createdAt: inserted?.created_at ?? new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (versionId) {
      const { data: ver, error: verErr } = await supabase
        .from('versions')
        .select('*')
        .eq('study_id', studyId)
        .eq('id', versionId)
        .single()

      if (verErr || !ver) {
        return new Response(
          JSON.stringify({ message: 'Version not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const snap = (ver.content_snapshot as Record<string, unknown>) ?? {}
      const lessons = Array.isArray(snap.lessons) ? snap.lessons : []
      const blocks = Array.isArray((snap as { blocks?: unknown[] }).blocks) ? (snap as { blocks: unknown[] }).blocks : lessons

      return new Response(
        JSON.stringify({
          id: ver.id,
          studyId: ver.study_id,
          versionNumber: ver.version_number,
          contentSnapshot: { blocks, lessons, ...snap },
          diffs: ver.diffs ?? {},
          createdAt: ver.created_at ?? new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: versions, error: listErr } = await supabase
      .from('versions')
      .select('id, study_id, version_number, created_at')
      .eq('study_id', studyId)
      .order('version_number', { ascending: false })

    if (listErr) {
      return new Response(
        JSON.stringify({ versions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const list = Array.isArray(versions) ? versions : []
    return new Response(
      JSON.stringify({
        versions: list.map((v) => ({
          id: v?.id,
          studyId: v?.study_id ?? studyId,
          versionNumber: v?.version_number ?? 0,
          createdAt: v?.created_at ?? new Date().toISOString(),
        })),
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
