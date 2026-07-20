'use client';

import { useTheme } from '../lib/theme/ThemeProvider'; // Importar el hook localmente definido
import { useEffect, useState } from 'react';
import Icon from './Icon';

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleTheme();
      }}
      style={{
        background: 'var(--color-border)',
        border: 'none',
        borderRadius: '15px',
        cursor: 'pointer',
        padding: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: theme === 'dark' ? 'flex-end' : 'flex-start',
        width: '45px',
        height: '24px',
        position: 'relative',
        transition: 'background-color 0.3s',
      }}
      aria-label="Cambiar tema"
    >
      <div
        style={{
          background: 'var(--color-background)',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        <Icon
          name={theme === 'dark' ? 'moon' : 'sun'}
          style={{
            width: '14px',
            height: '14px',
            color: 'var(--color-primary)',
          }}
        />
      </div>
    </button>
  );
}
