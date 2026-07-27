'use client';

import { useTheme } from '../lib/theme/ThemeProvider';
import Icon from './Icon';
import { useState, useRef, useEffect } from 'react';
import ThemeSwitcher from './ThemeSwitcher';

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
  const { theme } = useTheme();
  const [activePanel, setActivePanel] = useState<string>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [lang, setLang] = useState('ES');
  const menuRef = useRef<HTMLDivElement>(null);

  const WHATSAPP_NUMBER = '3765245980';
  const WHATSAPP_MESSAGE = 'Hola Software Oficial';

  const handleSendWhatsAppMessage = () => {
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`,
      '_blank'
    );
  };

  const handleCopyWhatsAppNumber = () => {
    navigator.clipboard?.writeText(`+${WHATSAPP_NUMBER}`);
  };

  const handleNavigate = (
    view: 'home' | 'stock' | 'sales' | 'control' | 'employees'
  ) => {
    setActivePanel(view);
    onNavigate(view);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsWhatsAppOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
                setIsWhatsAppOpen((prev) => !prev);
              }}
              style={menuButtonStyle}
            >
              <Icon name="whatsapp" style={menuIconStyle} />
              <span>WhatsApp</span>
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

        {isWhatsAppOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: 'calc(100% + var(--space-md))',
              right: '0',
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-sm)',
              minWidth: '260px',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                }}
              >
                <Icon name="whatsapp" style={menuIconStyle} />
                <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                  Contacta con nosotros
                </span>
              </div>
              <button
                onClick={() => setIsWhatsAppOpen(false)}
                aria-label="Cerrar"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-secondary)',
                  fontSize: '1.1rem',
                  lineHeight: 1,
                  padding: '0.25rem',
                }}
              >
                ✕
              </button>
            </div>

            <span
              style={{
                color: 'var(--color-secondary)',
                fontSize: '0.95rem',
              }}
            >
              +{WHATSAPP_NUMBER}
            </span>

            <button
              onClick={handleSendWhatsAppMessage}
              style={{
                background: 'var(--color-background)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                boxShadow: shadow,
                cursor: 'pointer',
                padding: 'calc(var(--space-sm) * 1.1)',
                color: 'var(--color-text)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-sm)',
              }}
            >
              <Icon name="whatsapp" style={{ width: '18px', height: '18px', color: 'var(--color-primary)' }} />
              <span>Enviar mensaje</span>
            </button>

            <button
              onClick={handleCopyWhatsAppNumber}
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                padding: 'calc(var(--space-sm) * 1.1)',
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-sm)',
              }}
            >
              <span>Copiar número</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
