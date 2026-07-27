'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';

interface OnboardingGuideWidgetProps {
  user: any;
  onNavigate?: (view: any) => void;
}

export default function OnboardingGuideWidget({
  user,
  onNavigate,
}: OnboardingGuideWidgetProps) {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({
          cmd: 'business.get_onboarding_guides',
          params: { role: user.role_name },
        }),
      });
      const result = await response.json();
      if (result.success) setGuides(result.data);
    } catch (error) {
      console.error('Error fetching onboarding guides:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando guías reales...</div>;
  if (guides.length === 0) return null; // Desaparece si no hay guías pendientes

  return (
    <div
      style={{
        padding: 'var(--space-md)',
        background: 'var(--color-primary-soft)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-primary)',
        marginBottom: 'var(--space-md)',
      }}
    >
      <h3 style={{ color: 'var(--color-primary)', marginTop: 0 }}>
        Guías para comenzar
      </h3>
      <p style={{ fontSize: '0.9rem', marginBottom: 'var(--space-md)' }}>
        Completa estas tareas para optimizar el uso de la plataforma:
      </p>

      <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
        {guides.map((guide: any, index: number) => (
          <div
            key={index}
            style={{
              padding: 'var(--space-sm)',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          >
            <strong style={{ display: 'block', marginBottom: '4px' }}>
              {guide.title}
            </strong>
            <p
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                margin: '0 0 8px 0',
              }}
            >
              {guide.description}
            </p>
            <button
              onClick={() => onNavigate?.(guide.view)}
              style={{
                fontSize: '0.75rem',
                padding: '6px 16px',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Comenzar ahora
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
