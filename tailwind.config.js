/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: 'var(--accent)',
        bg: 'var(--bg)',
        fg: 'var(--fg)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        pill: '9999px',
        card: 'var(--radius)',
      },
      spacing: {
        'nav-h': 'var(--nav-h)',
        'section-pad': 'var(--section-pad)',
        'card-gap': 'var(--card-gap)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
        fast: '150ms',
        slow: '300ms',
      },
    },
  },
  plugins: [],
};
