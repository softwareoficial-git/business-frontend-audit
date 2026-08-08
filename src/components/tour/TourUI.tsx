'use client';

import { useTour } from './TourProvider';
import { useEffect, useState } from 'react';

export default function TourUI() {
  const { isTourActive, currentStep } = useTour();
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (isTourActive && currentStep) {
      const element = document.querySelector(currentStep.targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      } else {
        setPosition(null);
      }
    } else {
      setPosition(null);
    }
  }, [isTourActive, currentStep]);

  if (!isTourActive || !currentStep || !position) return null;

  return (
    <>
      {/* Overlay transparente para eventos, pero visualmente tenue */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          zIndex: 1998,
          pointerEvents: 'none', // Permite clickear elementos de fondo
        }}
      />
      {/* Elemento resaltado con spotlight circular/redondeado y degradado */}
      <div
        style={{
          position: 'absolute',
          top: position.top - 6,
          left: position.left - 6,
          width: position.width + 12,
          height: position.height + 12,
          background: 'transparent',
          border: '3px solid transparent',
          backgroundImage: 'linear-gradient(var(--color-background), var(--color-background)), linear-gradient(to bottom right, var(--color-primary), var(--color-secondary))',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          borderRadius: '50%', // O 'var(--radius-lg)' si prefieres redondeado cuadrado
          zIndex: 1999,
          pointerEvents: 'none', // Permite clickear el elemento resaltado
          boxShadow: '0 0 15px rgba(0,0,0,0.2)',
        }}
      />
      {/* Mensaje de ayuda */}
      <div
        style={{
          position: 'absolute',
          top: position.top - 70,
          left: position.left + position.width / 2,
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: 'var(--radius-lg)',
          zIndex: 2000,
          boxShadow: 'var(--shadow-soft)',
          whiteSpace: 'nowrap',
          fontSize: '0.9rem',
          fontWeight: 600,
          pointerEvents: 'none',
        }}
      >
        {currentStep.message}
      </div>
    </>
  );
}
