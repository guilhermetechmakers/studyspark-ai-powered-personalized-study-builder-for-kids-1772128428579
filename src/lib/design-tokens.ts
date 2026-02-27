/**
 * Design token values for use in contexts where CSS variables cannot be used
 * (e.g. third-party iframes like Stripe Elements).
 * Values must stay in sync with src/index.css.
 */
export const designTokens = {
  /** Violet (primary) - rgb(91, 87, 165) */
  violet: 'rgb(91, 87, 165)',
  /** Lavender - rgb(169, 166, 249) */
  lavender: 'rgb(169, 166, 249)',
  /** Tangerine (accent) - rgb(255, 173, 90) */
  tangerine: 'rgb(255, 173, 90)',
} as const
