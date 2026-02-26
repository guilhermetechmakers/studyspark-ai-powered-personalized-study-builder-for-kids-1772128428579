/**
 * Supabase Edge Function: validate-promo
 * Validates promo code and returns discount info.
 * POST /functions/v1/validate-promo
 * Body: { code: string, itemsTotal: number }
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
    const body = await req.json().catch(() => ({}))
    const code = (body?.code ?? '').toString().trim()
    const itemsTotal = Number(body?.itemsTotal) || 0

    if (!code || code.length < 3) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Invalid code format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // In production: query promos table, check expires_at, usage_limit
    // Mock validation for demo
    const mockPromos: Record<string, { type: 'percent' | 'amount'; value: number }> = {
      SAVE10: { type: 'percent', value: 10 },
      SAVE5: { type: 'amount', value: 5 },
    }
    const promo = mockPromos[code.toUpperCase()]

    if (promo) {
      return new Response(
        JSON.stringify({
          valid: true,
          discountType: promo.type,
          value: promo.value,
          message: 'Code applied',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ valid: false, message: 'Invalid or expired code' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ valid: false, message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
