/**
 * NotFoundIllustration - Playful, child-friendly SVG illustration
 * for the 404 page. Communicates "lost but hopeful" without guilt-tripping.
 */

export function NotFoundIllustration() {
  return (
    <div
      className="mx-auto w-full max-w-[280px] sm:max-w-[320px] animate-fade-in"
      aria-hidden
    >
      <svg
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Soft gradient background circle */}
        <defs>
          <linearGradient id="peachGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(var(--peach-light))" />
            <stop offset="100%" stopColor="rgb(var(--peach))" />
          </linearGradient>
          <linearGradient id="lavenderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(var(--lavender))" />
            <stop offset="100%" stopColor="rgb(var(--violet))" />
          </linearGradient>
          <linearGradient id="tangerineGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="rgb(var(--tangerine))" />
            <stop offset="100%" stopColor="rgb(var(--coral))" />
          </linearGradient>
        </defs>

        {/* Friendly map/compass character - simplified friendly face */}
        <circle
          cx="160"
          cy="100"
          r="50"
          fill="url(#peachGrad)"
          stroke="rgb(var(--lavender))"
          strokeWidth="3"
          className="opacity-90"
        />
        <circle cx="145" cy="92" r="4" fill="rgb(var(--violet))" />
        <circle cx="175" cy="92" r="4" fill="rgb(var(--violet))" />
        <path
          d="M 140 115 Q 160 130 180 115"
          stroke="rgb(var(--violet))"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Question mark / magnifying glass - "searching" theme */}
        <circle
          cx="160"
          cy="180"
          r="28"
          fill="none"
          stroke="url(#lavenderGrad)"
          strokeWidth="4"
          strokeDasharray="4 6"
          className="animate-pulse"
        />
        <circle cx="160" cy="180" r="8" fill="rgb(var(--lavender))" />

        {/* Floating sparkles */}
        <circle cx="80" cy="60" r="4" fill="rgb(var(--tangerine))" className="opacity-70" />
        <circle cx="240" cy="70" r="3" fill="rgb(var(--lavender))" className="opacity-70" />
        <circle cx="100" cy="180" r="3" fill="rgb(var(--coral))" className="opacity-60" />
        <circle cx="220" cy="160" r="4" fill="rgb(var(--tangerine))" className="opacity-60" />

        {/* Small friendly star */}
        <path
          d="M 160 35 L 162 42 L 169 42 L 163 47 L 165 54 L 160 50 L 155 54 L 157 47 L 151 42 L 158 42 Z"
          fill="rgb(var(--tangerine))"
          className="opacity-80"
        />
      </svg>
    </div>
  )
}
