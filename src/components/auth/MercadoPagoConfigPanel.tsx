'use client';

import { useState, useEffect } from 'react';
import { configureGateway, getGatewayConfig } from '../../lib/billing';
import { useToast } from '../toast/ToastProvider';

export default function MercadoPagoConfigPanel({
  tenantId,
}: {
  tenantId: number;
}) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [config, setConfig] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { addToast } = useToast();

  const webhookUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9002'}/api/billing/webhook/${tenantId}`;

  useEffect(() => {
    fetchConfig();
  }, [tenantId]);

  const fetchConfig = async () => {
    setFetching(true);
    try {
      const res = await getGatewayConfig(tenantId, 'mercadopago');
      if (res.success && res.data && res.data.length > 0) {
        setConfig(res.data[0]);
      } else {
        setConfig(null);
      }
    } catch (e) {
      addToast('Error al cargar configuración', 'error');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      access_token: formData.get('accessToken'),
      public_key: formData.get('publicKey'),
      webhook_secret: formData.get('webhookSecret'),
    };

    try {
      const res = await configureGateway(
        tenantId,
        'mercadopago',
        data,
        'production'
      );
      if (res.success) {
        addToast('Configuración guardada exitosamente', 'success');
        setIsEditing(false);
        fetchConfig();
      } else {
        addToast('Error: ' + res.message, 'error');
      }
    } catch (e) {
      addToast('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div>Cargando...</div>;

  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        marginTop: '2rem',
      }}
    >
      <h2 style={{ marginTop: 0 }}>Mercado Pago</h2>

      {config && !isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              padding: '1rem',
              background: '#e6fffa',
              border: '1px solid #b2f5ea',
              borderRadius: '8px',
              color: '#234e52',
            }}
          >
            <strong>✅ Pasarela Activa</strong>
            <p style={{ margin: '0.5rem 0' }}>
              Estado: {config.is_active ? 'Activo' : 'Inactivo'}
            </p>
            <p style={{ margin: 0 }}>Entorno: {config.environment}</p>
          </div>
          <button onClick={() => setIsEditing(true)} className="btn-primary">
            Editar Credenciales
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <div
            style={{
              padding: '1rem',
              background: 'var(--color-background-secondary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
              URL de Webhook (Configurar en MP):
            </p>
            <code
              style={{
                display: 'block',
                background: '#eee',
                padding: '0.5rem',
                borderRadius: '4px',
                wordBreak: 'break-all',
              }}
            >
              {webhookUrl}
            </code>
          </div>
          <input
            name="accessToken"
            placeholder="Access Token"
            defaultValue={config?.config_data?.access_token}
            style={{
              padding: '0.8rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
          <input
            name="publicKey"
            placeholder="Public Key"
            defaultValue={config?.config_data?.public_key}
            style={{
              padding: '0.8rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
          <input
            name="webhookSecret"
            placeholder="Webhook Secret"
            defaultValue={config?.config_data?.webhook_secret}
            style={{
              padding: '0.8rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Guardando...' : 'Guardar Credenciales'}
          </button>
          {config && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Cancelar
            </button>
          )}
        </form>
      )}
    </div>
  );
}
