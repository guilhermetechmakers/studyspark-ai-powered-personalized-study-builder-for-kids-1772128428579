/**
 * Supabase Edge Function: studies-generate
 * Streams AI-generated study content via SSE.
 * POST /functions/v1/studies-generate
 * Body: { studyId, promptOverrides?, outputs? }
 * Streams: data: { type, progressPct?, stage?, block?, error? }
 * Requires: OPENAI_API_KEY in Supabase secrets
 */

import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function sse(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
          controller.enqueue(encoder.encode(sse({ type: 'error', error: 'Missing authorization' })))
          controller.close()
          return
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
          controller.enqueue(encoder.encode(sse({ type: 'error', error: 'Unauthorized' })))
          controller.close()
          return
        }

        const body = await req.json().catch(() => ({}))
        const studyId = (body?.studyId ?? '').toString()
        const outputs = Array.isArray(body?.outputs) ? body.outputs : ['flashcards', 'quizzes']

        if (!studyId) {
          controller.enqueue(encoder.encode(sse({ type: 'error', error: 'studyId required' })))
          controller.close()
          return
        }

        const { data: study, error: studyErr } = await supabase
          .from('studies')
          .select('id, topic, age, learning_style, context_notes')
          .eq('id', studyId)
          .eq('user_id', user.id)
          .single()

        if (studyErr || !study) {
          controller.enqueue(encoder.encode(sse({ type: 'error', error: 'Study not found' })))
          controller.close()
          return
        }

        await supabase.from('studies').update({ status: 'streaming', updated_at: new Date().toISOString() }).eq('id', studyId)
        controller.enqueue(encoder.encode(sse({ type: 'progress', progressPct: 5, stage: 'preparing' })))

        const apiKey = Deno.env.get('OPENAI_API_KEY')
        if (!apiKey) {
          const mockBlocks = [
            { type: 'text', content: `## ${study.topic}\n\nThis is a sample lesson for age ${study.age}. Key concepts will be covered.`, order: 0 },
            { type: 'list', content: '- Key point 1\n- Key point 2\n- Key point 3', order: 1 },
            { type: 'text', content: '## Summary\n\nPractice these concepts with the flashcards and quiz.', order: 2 },
          ]
          for (let i = 0; i < mockBlocks.length; i++) {
            controller.enqueue(encoder.encode(sse({ type: 'progress', progressPct: 20 + (i + 1) * 25, stage: 'generating' })))
            controller.enqueue(encoder.encode(sse({ type: 'block', block: mockBlocks[i] })))
          }
          controller.enqueue(encoder.encode(sse({ type: 'progress', progressPct: 100, stage: 'complete' })))
          controller.enqueue(encoder.encode(sse({ type: 'complete' })))
          await supabase.from('studies').update({ status: 'draft', updated_at: new Date().toISOString() }).eq('id', studyId)
          await supabase.from('drafts').upsert({
            study_id: studyId,
            version: 1,
            content_payload: { blocks: mockBlocks },
            updated_at: new Date().toISOString(),
          }, { onConflict: 'study_id' })
          controller.close()
          return
        }

        const openai = new OpenAI({ apiKey })
        const systemPrompt = `You are a friendly educational assistant creating study materials for children age ${study.age}.
Learning style: ${study.learning_style ?? 'playful'}.
Respond with a JSON array of blocks. Each block: { "type": "text"|"list", "content": "markdown string", "order": number }.
Example: [{"type":"text","content":"## Intro\\n\\nContent here","order":0},{"type":"list","content":"- Point 1\\n- Point 2","order":1}]
Keep content age-appropriate, clear, and engaging. Return only valid JSON.`

        const userPrompt = `Create study content for topic: ${study.topic}.
${study.context_notes ? `Additional context: ${study.context_notes}` : ''}
Generate 3-5 blocks: an intro, key points as a list, and a summary. Return a JSON array.`

        controller.enqueue(encoder.encode(sse({ type: 'progress', progressPct: 15, stage: 'calling_ai' })))

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          stream: false,
        })

        const rawContent = completion.choices[0]?.message?.content ?? ''
        let blocks: Array<{ type: string; content: string; order: number }> = []

        try {
          const cleaned = rawContent.replace(/```json\n?|\n?```/g, '').trim()
          const parsed = JSON.parse(cleaned)
          blocks = Array.isArray(parsed) ? parsed : (parsed?.blocks ?? [])
        } catch {
          blocks = [{ type: 'text', content: rawContent || `Study content for ${study.topic}`, order: 0 }]
        }

        for (let i = 0; i < blocks.length; i++) {
          controller.enqueue(encoder.encode(sse({ type: 'progress', progressPct: 30 + ((i + 1) / blocks.length) * 60, stage: 'generating' })))
          const block = blocks[i]
          if (block?.type && block?.content != null) {
            controller.enqueue(encoder.encode(sse({ type: 'block', block: { type: block.type, content: block.content, order: block.order ?? i } })))
          }
          await new Promise((r) => setTimeout(r, 150))
        }

        controller.enqueue(encoder.encode(sse({ type: 'progress', progressPct: 100, stage: 'complete' })))
        controller.enqueue(encoder.encode(sse({ type: 'complete' })))

        await supabase.from('studies').update({ status: 'draft', updated_at: new Date().toISOString() }).eq('id', studyId)
        await supabase.from('drafts').upsert({
          study_id: studyId,
          version: 1,
          content_payload: { blocks },
          updated_at: new Date().toISOString(),
        }, { onConflict: 'study_id' })
      } catch (err) {
        controller.enqueue(encoder.encode(sse({ type: 'error', error: (err as Error).message })))
      }
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
})
