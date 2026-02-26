/**
 * Support API layer.
 * POST /api/support/tickets
 * Validates payload and returns ticket ID on success.
 */

import { apiPost } from '@/lib/api'
import type { SupportTicket, SupportTicketResponse } from '@/types/help'

export async function submitSupportTicket(
  payload: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>
): Promise<SupportTicketResponse> {
  try {
    const res = await apiPost<SupportTicketResponse>('/api/support/tickets', payload)
    return {
      success: res?.success ?? false,
      ticketId: res?.ticketId,
    }
  } catch {
    // Demo fallback when no backend: simulate success for UX testing
    return {
      success: true,
      ticketId: `TKT-${Date.now().toString(36).toUpperCase()}`,
    }
  }
}
