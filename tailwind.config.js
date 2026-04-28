/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glow-primary':    '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-primary-lg': '0 0 40px rgba(16, 185, 129, 0.45)',
        'glow-accent':     '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-accent-lg':  '0 0 40px rgba(59, 130, 246, 0.45)',
        'glow-red':        '0 0 16px rgba(239, 68, 68, 0.4)',
        'premium-dark':    '0 24px 48px rgba(0, 0, 0, 0.45)',
        'premium-light':   '0 16px 32px rgba(0, 0, 0, 0.08)',
        'inner-glow':      'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'panel':           '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-in':      'fadeIn 0.4s ease forwards',
        'slide-up':     'slideUp 0.4s ease forwards',
        'scale-in':     'scaleIn 0.3s ease forwards',
        'glow-pulse':   'glowPulse 2.5s ease-in-out infinite alternate',
        'shimmer':      'shimmer 2s linear infinite',
        'pulse-slow':   'pulse 3s ease-in-out infinite',
        'float':        'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%':   { boxShadow: '0 0 10px rgba(16, 185, 129, 0.1)' },
          '100%': { boxShadow: '0 0 35px rgba(16, 185, 129, 0.45)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
