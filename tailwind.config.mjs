/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'deep-teal': '#287A74',
        'muted-teal': '#55A9A0',
        'mint-green': '#AEEED3',
        'pale-yellow': '#FFF8B0',
        // Semantic and stadium theme tokens
        stadium: {
          dark: '#0B0F12',
          card: '#131A20',
          border: '#1E293B',
          glow: '#AEEED3',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
        display: [
          'Oswald',
          'Impact',
          'Bebas Neue',
          'sans-serif',
        ],
      },
      boxShadow: {
        'glow-mint': '0 0 25px -3px rgba(174, 238, 211, 0.35)',
        'glow-teal': '0 0 25px -3px rgba(85, 169, 160, 0.4)',
        'luxury': '0 10px 30px -10px rgba(40, 122, 116, 0.15)',
      },
    },
  },
  plugins: [],
};
