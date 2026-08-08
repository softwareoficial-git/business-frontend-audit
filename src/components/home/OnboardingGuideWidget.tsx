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

  return (
    <div style={{ padding: 'var(--space-md)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: 'var(--space-md)' }}>
      
      {/* Sección de Descarga APK */}
      <div style={{ marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-md)', borderBottom: '1px solid var(--color-border)' }}>
        <h3 style={{ marginTop: 0 }}>¡Lleva la app en tu móvil!</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Descarga nuestra versión oficial para Android. Optimizado para escaneo ultra-rápido, modo batch, linterna integrada y gestión inteligente de inventario.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <a href="/downloads/app-arm64-v8a-release.apk" download style={{ padding: '8px 16px', background: 'var(--color-primary)', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '0.8rem' }}>
            Descargar ARM64 (Modernos)
          </a>
          <a href="/downloads/app-armeabi-v7a-release.apk" download style={{ padding: '8px 16px', background: 'var(--color-secondary)', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '0.8rem' }}>
            Descargar ARM32 (Anteriores)
          </a>
        </div>
      </div>

      {/* Sección de Guías */}
      {!loading && guides.length > 0 && (
        <>
          <h3 style={{ color: 'var(--color-primary)', marginTop: 0 }}>Guías para comenzar</h3>
          <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
            {guides.map((guide: any, index: number) => (
              <div key={index} style={{ padding: 'var(--space-sm)', background: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <strong>{guide.title}</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0' }}>{guide.description}</p>
                <button
                  onClick={() => onNavigate?.(guide.view)}
                  style={{ fontSize: '0.75rem', padding: '6px 12px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Ir a {guide.view === 'stock' ? 'Stock' : guide.view === 'sales' ? 'Ventas' : guide.view}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
