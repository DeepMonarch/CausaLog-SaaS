/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Causalog design system
        bg: {
          base: '#0a0e1a',
          surface: '#0f1526',
          card: '#131929',
          elevated: '#1a2038',
          border: '#1e2840',
        },
        accent: {
          cyan: '#00d4ff',
          teal: '#00b4d8',
          coral: '#ff6b6b',
          orange: '#ff9f43',
          purple: '#a78bfa',
          green: '#26de81',
        },
        text: {
          primary: '#e8eaf0',
          secondary: '#8892a4',
          muted: '#4a5568',
          inverse: '#0a0e1a',
        },
        severity: {
          high: '#ff6b6b',
          medium: '#ff9f43',
          low: '#26de81',
          info: '#00d4ff',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grid-subtle': `
          linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
        `,
        'gradient-auth': 'linear-gradient(135deg, #0a0e1a 0%, #0f1a2e 50%, #0a1020 100%)',
      },
      backgroundSize: {
        'grid-subtle': '40px 40px',
      },
      boxShadow: {
        'card': '0 0 0 1px rgba(0,212,255,0.08), 0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 0 0 1px rgba(0,212,255,0.2), 0 8px 32px rgba(0,0,0,0.5)',
        'glow-cyan': '0 0 20px rgba(0,212,255,0.15)',
        'glow-input': '0 0 0 3px rgba(0,212,255,0.12)',
        'inner-border': 'inset 0 0 0 1px rgba(255,255,255,0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
