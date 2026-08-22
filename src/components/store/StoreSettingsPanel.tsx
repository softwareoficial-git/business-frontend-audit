import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../lib/api';

const CLOUD_NAME = 'bvhc9tnp';
const UPLOAD_PRESET = 'navegador';

export const StoreSettingsPanel = () => {
  const [settings, setSettings] = useState({
    store_info: { name: '', whatsapp: '', address: '', description: '' },
    assets: { logo_url: '', banner_url: '' },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({ cmd: 'settings.get', params: {} }),
      });
      const result = await response.json();
      if (result.success && result.data) {
        setSettings((prev) => ({
          store_info: { ...prev.store_info, ...result.data.store_info },
          assets: { ...prev.assets, ...result.data.assets },
        }));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const uploadToCloudinary = async (file: File) => {
    setMessage({ type: 'success', text: 'Subiendo imagen...' });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await response.json();
      setMessage(null);
      return data.secure_url;
    } catch (e) {
      setMessage({ type: 'error', text: 'Error subiendo imagen' });
      return null;
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner'
  ) => {
    if (e.target.files && e.target.files[0]) {
      const url = await uploadToCloudinary(e.target.files[0]);
      if (url) {
        const assetKey = type === 'logo' ? 'logo_url' : 'banner_url';
        setSettings((prev) => ({
          ...prev,
          assets: { ...prev.assets, [assetKey]: url },
        }));
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({ cmd: 'settings.update', params: { settings } }),
      });
      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Tienda actualizada' });
      } else {
        throw new Error(result.message || 'Error al guardar');
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    }
    setSaving(false);
  };

  if (loading) return <div className="p-4">Cargando...</div>;

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      {message && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '8px',
            background: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
          }}
        >
          {message.text}
        </div>
      )}

      {/* Cabecera: Banner y Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            position: 'relative',
            height: '200px',
            borderRadius: '15px',
            overflow: 'hidden',
            cursor: 'pointer',
            backgroundColor: '#eee',
          }}
          onClick={() => bannerInputRef.current?.click()}
        >
          <img
            src={settings.assets.banner_url || '/placeholder-banner.png'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '5px',
            }}
          >
            Editar Banner
          </div>
        </div>

        <div
          style={{
            width: '100px',
            height: '100px',
            marginTop: '-60px',
            marginLeft: '1.5rem',
            cursor: 'pointer',
            position: 'relative',
            border: '4px solid var(--color-background)',
            borderRadius: '50%',
            overflow: 'hidden',
          }}
          onClick={() => logoInputRef.current?.click()}
        >
          <img
            src={settings.assets.logo_url || '/placeholder-logo.png'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            Editar
          </div>
        </div>
      </div>

      {/* Formulario con Grid Adaptativo */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}
      >
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Información Básica</h3>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <input
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '8px',
                border: '1px solid #ccc',
              }}
              value={settings.store_info.name}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  store_info: { ...settings.store_info, name: e.target.value },
                })
              }
              placeholder="Nombre de la tienda"
            />
            <textarea
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '8px',
                border: '1px solid #ccc',
                minHeight: '100px',
              }}
              value={settings.store_info.description}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  store_info: {
                    ...settings.store_info,
                    description: e.target.value,
                  },
                })
              }
              placeholder="Descripción corta de la tienda"
            />
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Contacto</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
            }}
          >
            <input
              style={{
                padding: '0.8rem',
                borderRadius: '8px',
                border: '1px solid #ccc',
              }}
              value={settings.store_info.whatsapp || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  store_info: {
                    ...settings.store_info,
                    whatsapp: e.target.value,
                  },
                })
              }
              placeholder="WhatsApp: +5491123456789"
            />
            <input
              style={{
                padding: '0.8rem',
                borderRadius: '8px',
                border: '1px solid #ccc',
              }}
              value={settings.store_info.address || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  store_info: {
                    ...settings.store_info,
                    address: e.target.value,
                  },
                })
              }
              placeholder="Dirección física"
            />
          </div>
        </div>

        <button
          className="btn-primary"
          style={{ padding: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
};
