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
      {/* Overlay para efecto de spotlight */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1999,
          pointerEvents: 'none',
        }}
      />
      {/* Elemento resaltado */}
      <div
        style={{
          position: 'absolute',
          top: position.top - 4,
          left: position.left - 4,
          width: position.width + 8,
          height: position.height + 8,
          backgroundColor: 'transparent',
          border: '2px solid var(--color-primary)',
          borderRadius: 'var(--radius-md)',
          zIndex: 2000,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
        }}
      />
      {/* Mensaje de ayuda */}
      <div
        style={{
          position: 'absolute',
          top: position.top - 60,
          left: position.left + position.width / 2,
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: 'var(--radius-md)',
          zIndex: 2001,
          boxShadow: 'var(--shadow-soft)',
          whiteSpace: 'nowrap',
          fontSize: '0.9rem',
          fontWeight: 500,
        }}
      >
        {currentStep.message}
      </div>
    </>
  );
}
