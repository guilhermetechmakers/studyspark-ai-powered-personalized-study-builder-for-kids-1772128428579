/**
 * Supabase Edge Function: privacy-delete
 * Handles privacy deletion requests - deletes user profile, child profiles, and auth user.
 * POST /functions/v1/privacy-delete
 * Requires: Authorization: Bearer <access_token>
 * Body: { confirmEmail?: string } - optional email confirmation
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
    const token = authHeader?.replace('Bearer ', '') ?? ''
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!token || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey)
    const { data: { user }, error: userError } = await adminClient.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = user.id

    // Insert audit entry before deletion
    await adminClient.from('profile_audit_log').insert({
      user_id: userId,
      action: 'privacy_delete_request',
      target_id: userId,
      target_type: 'user',
      changed_by: userId,
      changes: { requested_at: new Date().toISOString() },
    })

    // Delete child profiles (CASCADE or explicit)
    await adminClient.from('child_profiles').delete().eq('user_id', userId)

    // Delete profile (profiles table)
    await adminClient.from('profiles').delete().eq('id', userId)

    // Delete auth user (requires service role)
    await adminClient.auth.admin.deleteUser(userId)

    return new Response(
      JSON.stringify({ success: true, message: 'Account and data deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
