/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          darkest: '#050811',
          dark: '#0a0f1d',
          card: '#0f172a',
          cardHover: '#131e36',
          border: '#1e293b',
          borderGlow: '#22d3ee33',
          cyan: '#06b6d4',
          cyanGlow: '#22d3ee',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          accent: '#00f0ff',
          warning: '#f59e0b',
          danger: '#ef4444',
          success: '#10b981',
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.4)',
        'glow-blue': '0 0 20px -5px rgba(59, 130, 246, 0.4)',
        'glow-purple': '0 0 20px -5px rgba(139, 92, 246, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 3s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}
