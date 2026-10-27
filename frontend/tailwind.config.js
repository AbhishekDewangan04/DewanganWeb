/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      opacity: Object.fromEntries(Array.from({ length: 101 }, (_, i) => [i, `${i / 100}`])),
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '4xl': '2rem'
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        dew: {
          cyan: 'hsl(var(--dew-cyan) / <alpha-value>)',
          indigo: 'hsl(var(--dew-indigo) / <alpha-value>)',
          emerald: 'hsl(var(--dew-emerald) / <alpha-value>)',
          violet: 'hsl(var(--dew-violet) / <alpha-value>)',
          amber: 'hsl(var(--dew-amber) / <alpha-value>)',
          glow1: 'hsl(var(--glow-1) / <alpha-value>)',
          glow2: 'hsl(var(--glow-2) / <alpha-value>)',
          ink: 'hsl(var(--dew-ink))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)']
      },
      boxShadow: {
        glass: 'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 30px -8px rgba(6, 182, 212, 0.25)',
        'glass-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 30px -8px rgba(6, 182, 212, 0.35)',
        neon: '0 0 0 1px hsl(var(--glow-1) / 0.25), 0 20px 70px -25px hsl(var(--glow-1) / 0.5)'
      },
      transitionTimingFunction: {
        silk: 'cubic-bezier(0.22, 1, 0.36, 1)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        aurora: 'dew-aurora 20s ease-in-out infinite',
        float: 'dew-float 7s ease-in-out infinite',
        shimmer: 'dew-shimmer 1.7s linear infinite',
        pan: 'dew-pan 7s linear infinite',
        'fade-up': 'dew-fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
        pulseglow: 'dew-pulse 4.5s ease-in-out infinite',
        caret: 'dew-caret 1.1s step-end infinite'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
