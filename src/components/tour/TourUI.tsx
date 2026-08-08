'use client';

import { useTour } from './TourProvider';
import { useEffect, useState } from 'react';

export default function TourUI() {
  const { isTourActive, currentStep } = useTour();
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null
  );

  useEffect(() => {
    if (isTourActive && currentStep) {
      const element = document.querySelector(currentStep.targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
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
    <div
      style={{
        position: 'absolute',
        top: position.top - 60, // Adjust to place above the element
        left: position.left,
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        padding: '10px',
        borderRadius: '8px',
        zIndex: 2000,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      }}
    >
      {currentStep.message}
    </div>
  );
}
