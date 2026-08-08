'use client';

import { useTour } from './TourProvider';
import { useEffect, useState, useLayoutEffect, useRef } from 'react';

export default function TourUI() {
  const { isTourActive, currentStep } = useTour();
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  // Usamos useLayoutEffect para medir elementos antes del pintado del navegador
  useLayoutEffect(() => {
    if (!isTourActive || !currentStep) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const element = document.querySelector(currentStep.targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updatePosition();

    // Actualizar posición ante scroll y resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isTourActive, currentStep]);

  if (!isTourActive || !currentStep || !position) return null;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          zIndex: 9998,
          pointerEvents: 'none',
        }}
      />
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
          borderRadius: '50%',
          zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: '0 0 15px rgba(0,0,0,0.2)',
          transition: 'all 0.2s ease-out',
        }}
      />
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
          zIndex: 10000,
          boxShadow: 'var(--shadow-soft)',
          whiteSpace: 'nowrap',
          fontSize: '0.9rem',
          fontWeight: 600,
          pointerEvents: 'none',
          transition: 'all 0.2s ease-out',
        }}
      >
        {currentStep.message}
      </div>
    </>
  );
}
