import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ['class'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      heading: ['Montserrat', 'sans-serif'],
      display: ['Outfit', 'sans-serif'],
    },
    extend: {
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'ping-slow': 'ping 5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'progress': 'progress 2s ease-in-out infinite',
        'blink': 'blink 1.4s infinite'
      },
      keyframes: {
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' }
        },
        blink: {
          '0%': { opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0' }
        }
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
          foreground: 'hsl(var(--primary-foreground))',
          '50': '#fcfcfc',
          '100': '#f1f1f2',
          '200': '#e0e0e2',
          '300': '#c7c7cc',
          '400': '#a8a8af',
          '500': '#82828b',
          '600': '#57575f',
          '700': '#27272a',
          '800': '#111113',
          '900': '#040405',
          '950': '#000000'
        },
        secondary: {
          '50': '#fefcfc',
          '100': '#fdf2f2',
          '200': '#fae1e1',
          '300': '#f6c9c9',
          '400': '#f1abab',
          '500': '#eb8686',
          '600': '#e45a5a',
          '700': '#dc2828',
          '800': '#7c1414',
          '900': '#400a0a',
          '950': '#2c0707'
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
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
