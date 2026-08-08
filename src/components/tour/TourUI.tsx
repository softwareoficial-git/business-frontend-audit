'use client';

import { useTour } from './TourProvider';
import { useEffect, useState, useLayoutEffect } from 'react';

export default function TourUI() {
  const { isTourActive, currentStep } = useTour();
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

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
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isTourActive, currentStep]);

  if (!isTourActive || !currentStep || !position) return null;

  // Lógica de posicionamiento del tooltip
  const tooltipWidth = 200; // Ancho estimado del tooltip
  const isNearRightEdge =
    position.left + position.width + tooltipWidth > window.innerWidth;

  const tooltipStyle = {
    position: 'absolute' as const,
    // Si está cerca del borde derecho, al costado izquierdo; si no, arriba centrado
    top: isNearRightEdge
      ? position.top + position.height / 2
      : position.top - 60,
    left: isNearRightEdge
      ? position.left - 10 // A la izquierda del botón
      : position.left + position.width / 2,
    transform: isNearRightEdge
      ? 'translateY(-50%) translateX(-100%)'
      : 'translateX(-50%)',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: 'var(--radius-lg)',
    zIndex: 10000,
    boxShadow: 'var(--shadow-soft)',
    whiteSpace: 'nowrap' as const,
    fontSize: '0.9rem',
    fontWeight: 600,
    pointerEvents: 'none' as const,
    transition: 'all 0.2s ease-out',
  };

  return (
    <>
      {/* Spotlight: centro transparente con borde difuminado */}
      <div
        style={{
          position: 'absolute',
          top: position.top - 4,
          left: position.left - 4,
          width: position.width + 8,
          height: position.height + 8,
          borderRadius: '50%',
          zIndex: 9999,
          pointerEvents: 'none',
          boxShadow:
            '0 0 15px 5px rgba(var(--color-primary-rgb, 66, 133, 244), 0.5)',
          transition: 'all 0.2s ease-out',
        }}
      />
      <div style={tooltipStyle}>{currentStep.message}</div>
    </>
  );
}
