/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px' },
    },
    extend: {
      colors: {
        border: 'rgb(var(--border))',
        input: 'rgb(var(--input))',
        ring: 'rgb(var(--ring))',
        background: 'rgb(var(--background))',
        foreground: 'rgb(var(--foreground))',
        primary: {
          DEFAULT: 'rgb(var(--primary))',
          foreground: 'rgb(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary))',
          foreground: 'rgb(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent))',
          foreground: 'rgb(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'rgb(var(--destructive))',
          foreground: 'rgb(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'rgb(var(--success))',
          foreground: 'rgb(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'rgb(var(--warning))',
          foreground: 'rgb(var(--warning-foreground))',
        },
        info: {
          DEFAULT: 'rgb(var(--info))',
          foreground: 'rgb(var(--info-foreground))',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted))',
          foreground: 'rgb(var(--muted-foreground))',
        },
        /* StudySpark brand tokens for gradients and accents */
        peach: {
          light: 'rgb(var(--peach-light) / <alpha-value>)',
          DEFAULT: 'rgb(var(--peach) / <alpha-value>)',
        },
        lavender: 'rgb(var(--lavender) / <alpha-value>)',
        tangerine: 'rgb(var(--tangerine) / <alpha-value>)',
        violet: 'rgb(var(--violet) / <alpha-value>)',
        card: {
          DEFAULT: 'rgb(var(--card))',
          foreground: 'rgb(var(--card-foreground))',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        glow: 'var(--shadow-glow)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        /* Dialog-specific: opacity only to preserve centering transform */
        'dialog-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'flip-card': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        'flip-card-back': {
          '0%': { transform: 'rotateY(180deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '70%': { transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'celebration': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        'pop': {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '70%': { transform: 'scale(1.15)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'wobble': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%': { transform: 'rotate(-8deg)' },
          '40%': { transform: 'rotate(8deg)' },
          '60%': { transform: 'rotate(-5deg)' },
          '80%': { transform: 'rotate(5deg)' },
        },
        'star-burst': {
          '0%': { opacity: '0', transform: 'scale(0) rotate(-30deg)' },
          '60%': { transform: 'scale(1.3) rotate(10deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'xp-fill': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        'correct-pulse': {
          '0%': { transform: 'scale(1)', backgroundColor: 'rgb(34 197 94 / 0.1)' },
          '50%': { transform: 'scale(1.04)', backgroundColor: 'rgb(34 197 94 / 0.25)' },
          '100%': { transform: 'scale(1)', backgroundColor: 'rgb(34 197 94 / 0.1)' },
        },
        'wrong-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        'card-flip-front': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(-180deg)' },
        },
        'card-flip-back': {
          '0%': { transform: 'rotateY(180deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        'level-up': {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.8)' },
          '50%': { opacity: '1', transform: 'translateY(-10px) scale(1.15)' },
          '70%': { transform: 'translateY(0px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0px) scale(1)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(-8px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'toast-out': {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-8px) scale(0.98)' },
        },
        'slide-in-from-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out-to-right': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'slide-in-from-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out-to-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'slide-in-from-top': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-out-to-top': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        'slide-in-from-bottom': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-out-to-bottom': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        'dialog-fade-in': 'dialog-fade-in 0.2s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.3s ease-out forwards',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        pulse: 'pulse 2s ease-in-out infinite',
        'flip-card': 'flip-card 0.4s ease-in-out forwards',
        'flip-card-back': 'flip-card-back 0.4s ease-in-out forwards',
        'bounce-in': 'bounce-in 0.4s ease-out forwards',
        celebration: 'celebration 0.5s ease-in-out',
        pop: 'pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        wobble: 'wobble 0.5s ease-in-out',
        'star-burst': 'star-burst 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        float: 'float 3s ease-in-out infinite',
        'xp-fill': 'xp-fill 1s ease-out forwards',
        'correct-pulse': 'correct-pulse 0.5s ease-in-out',
        'wrong-shake': 'wrong-shake 0.4s ease-in-out',
        'card-flip-front': 'card-flip-front 0.35s ease-in-out forwards',
        'card-flip-back': 'card-flip-back 0.35s ease-in-out forwards',
        'level-up': 'level-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'spin-slow': 'spin-slow 8s linear infinite',
        'toast-in': 'toast-in 0.2s ease-out forwards',
        'toast-out': 'toast-out 0.2s ease-out forwards',
        'slide-in-from-right': 'slide-in-from-right 0.3s ease-out forwards',
        'slide-out-to-right': 'slide-out-to-right 0.3s ease-out forwards',
        'slide-in-from-left': 'slide-in-from-left 0.3s ease-out forwards',
        'slide-out-to-left': 'slide-out-to-left 0.3s ease-out forwards',
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out forwards',
        'slide-out-to-top': 'slide-out-to-top 0.3s ease-out forwards',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out forwards',
        'slide-out-to-bottom': 'slide-out-to-bottom 0.3s ease-out forwards',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
