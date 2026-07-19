'use client';

import { useTheme } from '../lib/theme/ThemeProvider';

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor:
          theme === 'light'
            ? 'var(--color-primary-light)'
            : 'var(--color-primary-dark)',
        color:
          theme === 'light'
            ? 'var(--color-text-light)'
            : 'var(--color-text-dark)',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '1rem',
      }}
    >
      Cambiar a {theme === 'light' ? 'Oscuro' : 'Claro'}
    </button>
  );
}
