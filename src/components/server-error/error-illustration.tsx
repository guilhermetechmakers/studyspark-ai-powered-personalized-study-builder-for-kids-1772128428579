/**
 * ErrorIllustration - Accessible decorative SVG for 500 Server Error page.
 * Conveys a temporary issue with warm, friendly visuals.
 */

export function ErrorIllustration() {
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
        <defs>
          <linearGradient id="serverErrorPeach" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(var(--peach-light))" />
            <stop offset="100%" stopColor="rgb(var(--peach))" />
          </linearGradient>
          <linearGradient id="serverErrorLavender" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(var(--lavender))" />
            <stop offset="100%" stopColor="rgb(var(--violet))" />
          </linearGradient>
          <linearGradient id="serverErrorTangerine" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="rgb(var(--tangerine))" />
            <stop offset="100%" stopColor="rgb(var(--coral))" />
          </linearGradient>
        </defs>

        {/* Cloud/server shape - friendly rounded form */}
        <ellipse
          cx="160"
          cy="95"
          rx="55"
          ry="35"
          fill="url(#serverErrorPeach)"
          stroke="rgb(var(--lavender))"
          strokeWidth="3"
          className="opacity-90"
        />
        <ellipse
          cx="160"
          cy="85"
          rx="40"
          ry="25"
          fill="rgb(var(--peach-light))"
          stroke="rgb(var(--lavender))"
          strokeWidth="2"
          className="opacity-80"
        />

        {/* Status indicator - subtle animated gear/cog (temporary fix in progress) */}
        <g transform="translate(160, 95)">
          <circle
            r="18"
            fill="none"
            stroke="url(#serverErrorLavender)"
            strokeWidth="3"
            strokeDasharray="4 6"
            className="animate-pulse"
          />
          <circle r="6" fill="rgb(var(--violet))" />
          <path
            d="M 0 -14 L 0 -18 M 0 14 L 0 18 M -14 0 L -18 0 M 14 0 L 18 0 M -10 -10 L -12 -12 M 10 10 L 12 12 M -10 10 L -12 12 M 10 -10 L 12 -12"
            stroke="rgb(var(--violet))"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Friendly sparkles - "we're on it" */}
        <circle
          cx="85"
          cy="65"
          r="4"
          fill="rgb(var(--tangerine))"
          className="opacity-70 animate-pulse"
        />
        <circle
          cx="235"
          cy="70"
          r="3"
          fill="rgb(var(--lavender))"
          className="opacity-70 animate-pulse"
        />
        <circle
          cx="95"
          cy="175"
          r="3"
          fill="rgb(var(--coral))"
          className="opacity-60"
        />
        <circle
          cx="225"
          cy="165"
          r="4"
          fill="rgb(var(--tangerine))"
          className="opacity-60"
        />

        {/* Small heart - caring/reassuring */}
        <path
          d="M 160 195 C 155 190 148 195 148 200 C 148 208 160 218 160 218 C 160 218 172 208 172 200 C 172 195 165 190 160 195 Z"
          fill="rgb(var(--coral))"
          className="opacity-80"
        />
      </svg>
    </div>
  )
}
