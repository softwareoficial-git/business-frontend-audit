import React, { useState, useEffect } from 'react';
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
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

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
    setUploading(true);
    setMessage({ type: 'success', text: 'Subiendo imagen a la nube...' });
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
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = async (
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
        setMessage({
          type: 'success',
          text: '¡Cambios guardados correctamente en el servidor!',
        });
      } else {
        throw new Error(result.message || 'Error al guardar');
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    }
    setSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.8rem',
    margin: '0.5rem 0',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
    outline: 'none',
    boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.05)',
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--color-background)',
    padding: '2rem',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-card)',
    maxWidth: '600px',
    margin: '0 auto',
    color: 'var(--color-text)',
  };

  if (loading) return <div style={cardStyle}>Cargando panel...</div>;

  return (
    <div style={cardStyle}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        Editar Tienda
      </h2>

      {message && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1rem',
            borderRadius: '8px',
            background: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
          }}
        >
          {message.text}
        </div>
      )}

      {/* Imágenes */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 'bold' }}>Logo (Perfil)</label>
            <input type="file" onChange={(e) => handleImageChange(e, 'logo')} />
            {settings.assets.logo_url && (
              <img
                src={settings.assets.logo_url}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  marginTop: '10px',
                  border: '2px solid var(--color-border)',
                }}
              />
            )}
          </div>
          <div style={{ flex: 2 }}>
            <label style={{ fontWeight: 'bold' }}>Banner</label>
            <input
              type="file"
              onChange={(e) => handleImageChange(e, 'banner')}
            />
            {settings.assets.banner_url && (
              <img
                src={settings.assets.banner_url}
                style={{
                  width: '100%',
                  height: '100px',
                  borderRadius: '8px',
                  marginTop: '10px',
                  border: '2px solid var(--color-border)',
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Detalles */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontWeight: 'bold' }}>Nombre de la Tienda</label>
        <input
          style={inputStyle}
          value={settings.store_info.name}
          onChange={(e) =>
            setSettings({
              ...settings,
              store_info: { ...settings.store_info, name: e.target.value },
            })
          }
        />

        <label style={{ fontWeight: 'bold' }}>WhatsApp</label>
        <input
          style={inputStyle}
          value={settings.store_info.whatsapp}
          onChange={(e) =>
            setSettings({
              ...settings,
              store_info: { ...settings.store_info, whatsapp: e.target.value },
            })
          }
        />

        <label style={{ fontWeight: 'bold' }}>Descripción</label>
        <textarea
          style={{ ...inputStyle, height: '100px' }}
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
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving || uploading}
        className="btn-primary"
        style={{
          width: '100%',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          cursor: saving || uploading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
        }}
      >
        {saving ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </div>
  );
};
