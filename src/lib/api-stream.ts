/**
 * Streaming fetch utility for SSE and chunked responses.
 * Used by Study Builder for progressive AI generation previews.
 */

import { supabase } from '@/lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''

export interface StreamCallbacks<T> {
  onChunk?: (chunk: T) => void
  onProgress?: (pct: number, stage?: string) => void
  onComplete?: () => void
  onError?: (err: Error) => void
}

/**
 * Fetches a streaming endpoint and invokes callbacks for each parsed SSE event.
 * Expects NDJSON (newline-delimited JSON) or SSE format.
 */
export async function fetchStream<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST'
    body?: unknown
    signal?: AbortSignal
  } = {},
  callbacks: StreamCallbacks<T>
): Promise<void> {
  const { method = 'POST', body, signal } = options

  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const url = path.startsWith('http') ? path : `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/${path}`
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: signal ?? undefined,
  })

  if (!res.ok) {
    const errText = await res.text()
    const err = new Error(errText || `HTTP ${res.status}`)
    callbacks.onError?.(err)
    throw err
  }

  const reader = res.body?.getReader()
  if (!reader) {
    callbacks.onError?.(new Error('No response body'))
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith(':')) continue

        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6)
          if (data === '[DONE]') {
            callbacks.onComplete?.()
            return
          }
          try {
            const parsed = JSON.parse(data) as T
            const obj = parsed as Record<string, unknown>
            if (obj?.type === 'complete') {
              callbacks.onComplete?.()
            }
            if (obj?.type === 'progress' && typeof obj.progressPct === 'number') {
              callbacks.onProgress?.(obj.progressPct, obj.stage as string | undefined)
            }
            callbacks.onChunk?.(parsed)
          } catch {
            // skip malformed JSON
          }
        } else {
          try {
            const parsed = JSON.parse(trimmed) as T
            const obj = parsed as Record<string, unknown>
            if (obj?.type === 'progress' && typeof obj.progressPct === 'number') {
              callbacks.onProgress?.(obj.progressPct, obj.stage as string | undefined)
            }
            callbacks.onChunk?.(parsed)
          } catch {
            // skip
          }
        }
      }
    }

    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer.trim()) as T
        callbacks.onChunk?.(parsed)
      } catch {
        // skip
      }
    }

    callbacks.onComplete?.()
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      callbacks.onError?.(err as Error)
    }
    throw err
  }
}
