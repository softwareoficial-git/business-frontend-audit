'use client';

import Icon from './Icon';
import { useState, useRef, useEffect } from 'react';
import ThemeSwitcher from './ThemeSwitcher';

interface DockProps {
  onLogout: () => void;
  onNavigate: (view: 'home' | 'stock' | 'sales' | 'control' | 'employees') => void;
  onOpenProfile: () => void;
  role: string;
}

export default function Dock({ onLogout, onNavigate, onOpenProfile, role }: DockProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const iconStyle = {
    width: '26px',
    height: '26px',
    color: 'var(--color-primary)',
  };

  const menuButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.5rem',
  };

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '500px',
        backgroundColor: 'var(--color-background)',
        borderRadius: '25px',
        border: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1.5rem',
        zIndex: 1000,
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      }}
    >
      <button
        onClick={() => onNavigate('home')}
        aria-label="Home"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <Icon name="home" style={iconStyle} />
      </button>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <button
          onClick={() => onNavigate('stock')}
          aria-label="Stock"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Icon name="stock" style={iconStyle} />
        </button>
        <button
          onClick={() => onNavigate('sales')}
          aria-label="Ventas"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Icon name="sales" style={iconStyle} />
        </button>
        {role === 'DUEÑO' && (
          <>
            <button
              onClick={() => onNavigate('control')}
              aria-label="Control"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Icon name="control" style={iconStyle} />
            </button>
            <button
              onClick={() => onNavigate('employees')}
              aria-label="Empleados"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Icon name="menu" style={iconStyle} />
            </button>
          </>
        )}
      </div>

      <div ref={menuRef} style={{ position: 'relative' }}>
        <button
          onClick={toggleMenu}
          aria-label="Menú"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Icon name="menu" style={iconStyle} />
        </button>

        {isMenuOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 1rem)',
              right: '0',
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              minWidth: '220px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            }}
          >
            <button onClick={onOpenProfile} style={menuButtonStyle}>
              <Icon name="home" style={{ ...iconStyle, width: '20px', height: '20px' }} />
              <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>Perfil</span>
            </button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>Tema</span>
              <ThemeSwitcher />
            </div>

            <hr style={{ width: '100%', border: '0', borderTop: '1px solid var(--color-border)', margin: '0.25rem 0' }} />

            <button
              onClick={onLogout}
              style={{
                cursor: 'pointer',
                background: 'var(--color-error-bg)',
                border: 'none',
                color: 'var(--color-error)',
                padding: '0.75rem',
                borderRadius: '12px',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
