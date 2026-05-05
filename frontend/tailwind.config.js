/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orbis: {
          bg: '#010828',
          cream: '#EFF4FF',
          neon: '#6FFF00',
        },
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c', // Primary Admin Color
          MAIN: '#ea580c', // Tech Store primary color
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        admin: {
          primary: '#ea580c', // Matches primary.600
          sidebar: '#1a1a2e',
          bg: '#f8fafc',
          success: '#16a34a',
          warning: '#ca8a04',
          info: '#2563eb',
          danger: '#dc2626',
          purple: '#7c3aed',
        },
        secondary: {
          MAIN: '#1e293b', // Dark navy
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        background: {
          DEFAULT: '#f7f7f7', // Updated to requested background color
        },
        accent: {
          DEFAULT: '#ff4d00', // Updated to match requested price/important color
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        text: {
          primary: '#222222',
          secondary: '#555555',
          tertiary: '#757575',
        },
        border: {
          DEFAULT: '#e5e7eb',
          light: '#f3f4f6',
        },
        dark: {
          bg: '#111318',    // Midnight Gray-Blue Background
          secondary: '#1c1f26', // Midnight Card Background
          card: '#1c1f26',  // Midnight Card Background
          border: '#2e3140', // Subtle Border
          text: '#f9fafb',
          textSecondary: '#9ca3af',
        },
        success: {
          light: '#dcfce7',
          DEFAULT: '#22c55e',
          dark: '#15803d',
        },
        warning: {
          light: '#fef9c3',
          DEFAULT: '#eab308',
          dark: '#a16207',
        },
        error: {
          light: '#fee2e2',
          DEFAULT: '#ef4444',
          dark: '#b91c1c',
        },
        info: {
          light: '#dbeafe',
          DEFAULT: '#3b82f6',
          dark: '#1d4ed8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'Roboto', 'system-ui', 'sans-serif'],
        grotesk: ['Anton', 'sans-serif'],
        condiment: ['Condiment', 'cursive'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 12px 30px rgba(0, 0, 0, 0.1)', // Updated to requested shadow
        'card-dark': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'search': '0 2px 12px rgba(0, 0, 0, 0.08)', // New search shadow
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '48px',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px', // Requested for cards
        xl: '20px',
        full: '999px', // Added for search/buttons
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleUpCenter: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-up-center': 'scaleUpCenter 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}
