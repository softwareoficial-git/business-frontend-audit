'use client';

import { useTheme } from '../lib/theme/ThemeProvider';
import Icon from './Icon';
import { useState, useRef, useEffect } from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import { useTour } from './tour/TourProvider';

interface DockProps {
  onLogout: () => void;
  onNavigate: (
    view:
      | 'home'
      | 'stock'
      | 'sales'
      | 'control'
      | 'employees'
      | 'game'
      | 'mercadopago'
      | 'help'
      | 'store'
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
  const { theme } = useTheme();
  const { triggerEvent } = useTour();
  const [activePanel, setActivePanel] = useState<string>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState('ES');
  const menuRef = useRef<HTMLDivElement>(null);
  const handleNavigate = (
    view:
      | 'home'
      | 'stock'
      | 'sales'
      | 'control'
      | 'employees'
      | 'game'
      | 'mercadopago'
      | 'help'
      | 'store'
  ) => {
    setActivePanel(view);
    onNavigate(view);
    triggerEvent(`navigate_${view}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      triggerEvent('menu_opened');
    }
  };

  const iconStyle = {
    width: '26.4px',
    height: '26.4px',
    color: 'var(--color-primary)',
  };

  // Neumorphism: Sombra más clara/blanca para modo claro, sombra más oscura/negra para modo oscuro
  const shadow =
    theme === 'light'
      ? '4px 4px 6px rgba(0, 0, 0, 0.1), -4px -4px 6px rgba(255, 255, 255, 0.5)'
      : '4px 4px 6px rgba(0, 0, 0, 0.5), -4px -4px 6px rgba(255, 255, 255, 0.05)';

  const activeButtonStyle = {
    background: 'var(--color-background)',
    borderRadius: '50%',
    padding: 'calc(var(--space-sm) * 1.1)',
    border: 'none',
    boxShadow: shadow,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const defaultButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 'calc(var(--space-sm) * 1.1)',
  };

  const menuButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    width: '100%',
    padding: 'calc(var(--space-sm) * 1.1)',
    color: 'var(--color-text)',
    fontSize: '1.1rem',
    borderRadius: 'var(--radius-md)',
  };

  const menuIconStyle = {
    width: '22px',
    height: '22px',
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
        borderRadius: '27.5px',
        border: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'calc(var(--space-xs) * 1.1) calc(var(--space-md) * 1.1)',
        zIndex: 1000,
        boxShadow: 'var(--shadow-soft)',
        gap: 'calc(var(--space-sm) * 1.1)',
      }}
    >
      <button
        onClick={() => handleNavigate('home')}
        aria-label="Home"
        style={activePanel === 'home' ? activeButtonStyle : defaultButtonStyle}
      >
        <Icon name="home" style={iconStyle} />
      </button>

      <button
        onClick={() => handleNavigate('stock')}
        aria-label="Stock"
        style={activePanel === 'stock' ? activeButtonStyle : defaultButtonStyle}
      >
        <Icon name="stock" style={iconStyle} />
      </button>
      <button
        onClick={() => handleNavigate('sales')}
        aria-label="Ventas"
        style={activePanel === 'sales' ? activeButtonStyle : defaultButtonStyle}
      >
        <Icon name="sales" style={iconStyle} />
      </button>
      {role === 'DUEÑO' && (
        <button
          onClick={() => handleNavigate('employees')}
          aria-label="Empleados"
          style={
            activePanel === 'employees' ? activeButtonStyle : defaultButtonStyle
          }
        >
          <Icon name="user" style={iconStyle} />
        </button>
      )}

      <div ref={menuRef} style={{ position: 'relative' }}>
        <button
          onClick={toggleMenu}
          aria-label="Menú"
          style={defaultButtonStyle}
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

            <button
              onClick={() => {
                handleNavigate('store');
                toggleMenu();
              }}
              style={menuButtonStyle}
            >
              <Icon name="store" style={menuIconStyle} />
              <span>Tienda</span>
            </button>

            {/* {role === 'DUEÑO' && (
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
                onNavigate('game');
                toggleMenu();
              }}
              style={menuButtonStyle}
            >
              <Icon name="sales" style={menuIconStyle} />
              <span>Modo Juego</span>
            </button> */}

            <button
              onClick={() => {
                onNavigate('help');
                toggleMenu();
              }}
              style={menuButtonStyle}
            >
              <Icon name="help" style={menuIconStyle} />
              <span>Ayuda</span>
            </button>

            <button
              onClick={() => {
                onNavigate('mercadopago');
                toggleMenu();
              }}
              style={menuButtonStyle}
            >
              <Icon name="sales" style={menuIconStyle} />
              <span>Mercado Pago</span>
            </button>

            <button
              onClick={() => {
                toggleMenu();
              }}
              style={menuButtonStyle}
            >
              <Icon name="settings" style={menuIconStyle} />
              <span>Configuración</span>
            </button>

            <div
              className="theme-container"
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
    </nav>
  );
}
