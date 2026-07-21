'use client';

import Icon from './Icon';
import { useState, useRef, useEffect } from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import AuditPanel from './debug/AuditPanel';

interface DockProps {
  onLogout: () => void;
  onNavigate: (
    view: 'home' | 'stock' | 'sales' | 'control' | 'employees'
  ) => void;
  onOpenProfile: () => void;
  role: string;
}

export default function Dock({
  onLogout,
  onNavigate,
  onOpenProfile,
  role,
}: DockProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState('ES');
  const [showAudit, setShowAudit] = useState(false);
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
    width: '24px',
    height: '24px',
    color: 'var(--color-primary)',
  };

  const menuButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    width: '100%',
    padding: 'var(--space-sm)',
    color: 'var(--color-text)',
    fontSize: '1rem',
    borderRadius: 'var(--radius-md)',
  };

  const menuIconStyle = {
    width: '20px',
    height: '20px',
    color: 'var(--color-secondary)',
  };

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 'var(--space-md)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'fit-content',
        backgroundColor: 'var(--color-background)',
        borderRadius: '25px',
        border: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'var(--space-xs) var(--space-md)',
        zIndex: 1000,
        boxShadow: 'var(--shadow-soft)',
        gap: 'var(--space-sm)',
      }}
    >
      <button
        onClick={() => onNavigate('home')}
        aria-label="Home"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 'var(--space-sm)',
        }}
      >
        <Icon name="home" style={iconStyle} />
      </button>

      <button
        onClick={() => onNavigate('stock')}
        aria-label="Stock"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 'var(--space-sm)',
        }}
      >
        <Icon name="stock" style={iconStyle} />
      </button>
      <button
        onClick={() => onNavigate('sales')}
        aria-label="Ventas"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 'var(--space-sm)',
        }}
      >
        <Icon name="sales" style={iconStyle} />
      </button>
      {role === 'DUEÑO' && (
        <button
          onClick={() => onNavigate('employees')}
          aria-label="Empleados"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 'var(--space-sm)',
          }}
        >
          <Icon name="user" style={iconStyle} />
        </button>
      )}

      <div ref={menuRef} style={{ position: 'relative' }}>
        <button
          onClick={toggleMenu}
          aria-label="Menú"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 'var(--space-sm)',
          }}
        >
          <Icon name="menu" style={iconStyle} />
        </button>

        {isMenuOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: 'calc(100% + var(--space-md))',
              right: '0',
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-sm)',
              display: 'flex',
              flexDirection: 'column',
              minWidth: '220px',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            <button
              onClick={() => {
                onOpenProfile();
                toggleMenu();
              }}
              style={menuButtonStyle}
            >
              <Icon name="user" style={menuIconStyle} />
              <span>Perfil</span>
            </button>

            {role === 'DUEÑO' && (
              <button
                onClick={() => {
                  onNavigate('control');
                  toggleMenu();
                }}
                style={menuButtonStyle}
              >
                <Icon name="control" style={menuIconStyle} />
                <span>Control</span>
              </button>
            )}

            <button
              onClick={() => {
                toggleMenu();
              }}
              style={menuButtonStyle}
            >
              <Icon name="settings" style={menuIconStyle} />
              <span>Configuración</span>
            </button>

            <button
              onClick={() => {
                setShowAudit(!showAudit);
                toggleMenu();
              }}
              style={menuButtonStyle}
            >
              <Icon name="control" style={menuIconStyle} />
              <span>Auditoría</span>
            </button>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-sm) var(--space-md)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                }}
              >
                <Icon name="theme" style={menuIconStyle} />
                <span style={{ fontWeight: 600 }}>Tema</span>
              </div>
              <ThemeSwitcher />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-sm) var(--space-md)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                }}
              >
                <Icon name="language" style={menuIconStyle} />
                <span style={{ fontWeight: 600 }}>Idioma</span>
              </div>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                style={{
                  background: 'var(--color-border)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.25rem 0.5rem',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                }}
              >
                <option value="ES">ES</option>
                <option value="EN">EN</option>
              </select>
            </div>

            <hr
              style={{
                width: '100%',
                border: '0',
                borderTop: '1px solid var(--color-border)',
                margin: 'var(--space-sm) 0',
              }}
            />

            <button
              onClick={onLogout}
              style={{ ...menuButtonStyle, color: 'var(--color-error)' }}
            >
              <Icon
                name="logout"
                style={{ ...menuIconStyle, color: 'var(--color-error)' }}
              />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
      {showAudit && <AuditPanel onClose={() => setShowAudit(false)} />}
    </nav>
  );
}
