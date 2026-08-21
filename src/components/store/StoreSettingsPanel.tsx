import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';

const CLOUD_NAME = 'bvhc9tnp';
const UPLOAD_PRESET = 'navegador';

export const StoreSettingsPanel = () => {
  const [settings, setSettings] = useState({
    store_info: { name: '', whatsapp: '', address: '' },
    assets: { logo_url: '', banner_url: '' },
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  const uploadToCloudinary = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    setUploading(false);
    return data.secure_url;
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner'
  ) => {
    if (e.target.files && e.target.files[0]) {
      const url = await uploadToCloudinary(e.target.files[0]);
      const assetKey = type === 'logo' ? 'logo_url' : 'banner_url';
      setSettings((prev) => ({
        ...prev,
        assets: { ...prev.assets, [assetKey]: url },
      }));
    }
  };

  const handleSave = async () => {
    const response = await apiClient('/execute', {
      method: 'POST',
      body: JSON.stringify({ cmd: 'settings.update', params: { settings } }),
    });
    const result = await response.json();
    if (result.success) alert('Tienda actualizada con éxito');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.8rem',
    margin: '0.5rem 0',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background)',
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

  if (loading) return <div style={cardStyle}>Cargando...</div>;

  return (
    <div style={cardStyle}>
      <h2 style={{ marginBottom: '1.5rem' }}>Configuración de Tienda</h2>

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
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <label style={{ fontWeight: 'bold' }}>Logo</label>
          <input type="file" onChange={(e) => handleImageChange(e, 'logo')} />
          {settings.assets.logo_url && (
            <img
              src={settings.assets.logo_url}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                marginTop: '10px',
              }}
            />
          )}
        </div>
        <div>
          <label style={{ fontWeight: 'bold' }}>Banner</label>
          <input type="file" onChange={(e) => handleImageChange(e, 'banner')} />
          {settings.assets.banner_url && (
            <img
              src={settings.assets.banner_url}
              style={{
                width: '100%',
                height: '80px',
                borderRadius: '8px',
                marginTop: '10px',
              }}
            />
          )}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={uploading}
        className="btn-primary"
        style={{
          width: '100%',
          padding: '0.8rem',
          borderRadius: 'var(--radius-md)',
          cursor: uploading ? 'not-allowed' : 'pointer',
        }}
      >
        {uploading ? 'Procesando...' : 'Guardar Cambios'}
      </button>
    </div>
  );
};
