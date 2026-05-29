import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — industrial dark navy + amber (works in both modes)
        brand: {
          50:  '#eef4ff',
          100: '#dce9ff',
          200: '#b2d0ff',
          300: '#77adff',
          400: '#3582ff',
          500: '#0a5cf5',
          600: '#0044d6',
          700: '#0036ad',
          800: '#002f8e',
          900: '#052974',   // primary deep navy
          950: '#021847',
        },
        amber: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',   // accent amber
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        slate: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          card:    'var(--color-surface-card)',
          border:  'var(--color-surface-border)',
          muted:   'var(--color-surface-muted)',
          hover:   'var(--color-surface-hover)',
          active:  'var(--color-surface-active)',
        },
        text: {
          primary:   'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted:     'var(--color-text-muted)',
        },
      },

      fontFamily: {
        sans:    ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'Outfit', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },

      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':   'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient':    'linear-gradient(135deg, #021847 0%, #052974 40%, #0a1a3e 100%)',
        'card-gradient':    'linear-gradient(145deg, #0d1526 0%, #0a0f1e 100%)',
        'amber-gradient':   'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'shine':            'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',
      },

      boxShadow: {
        'glow-amber': 'var(--shadow-glow-amber)',
        'glow-blue':  'var(--shadow-glow-blue)',
        'card':       'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'sm':         'var(--shadow-sm)',
        'md':         'var(--shadow-md)',
        'lg':         'var(--shadow-lg)',
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      animation: {
        'fade-in':       'fadeIn 0.5s ease-out',
        'slide-up':      'slideUp 0.5s ease-out',
        'slide-down':    'slideDown 0.3s ease-out',
        'scale-in':      'scaleIn 0.3s ease-out',
        'shine':         'shine 2.5s infinite',
        'float':         'float 6s ease-in-out infinite',
        'pulse-slow':    'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':     'spin 8s linear infinite',
      },

      keyframes: {
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:  { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown:{ from: { opacity: '0', transform: 'translateY(-10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:  { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shine:    {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
      },

      transitionTimingFunction: {
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      transitionDuration: {
        'fast':  'var(--transition-fast)',
        'base':  'var(--transition-base)',
        'slow':  'var(--transition-slow)',
      },

      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      screens: {
        'xs': '475px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
}

export default config
