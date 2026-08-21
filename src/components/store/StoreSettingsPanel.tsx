import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';

export const StoreSettingsPanel = () => {
  const [settings, setSettings] = useState({
    store_info: { name: '', whatsapp: '', address: '' },
    assets: { logo_url: '', banner_url: '' },
    themes: { selected_theme_id: 'default' },
  });
  const [loading, setLoading] = useState(true);

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
        themes: { ...prev.themes, ...result.data.themes },
      }));
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    await apiClient('/execute', {
      method: 'POST',
      body: JSON.stringify({ cmd: 'settings.update', params: { settings } }),
    });
    alert('Configuración guardada');
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Configuración de Tienda</h2>
      <div className="space-y-4">
        <input
          type="text"
          value={settings.store_info.name}
          onChange={(e) =>
            setSettings({
              ...settings,
              store_info: { ...settings.store_info, name: e.target.value },
            })
          }
          placeholder="Nombre de la tienda"
          className="block w-full p-2 border rounded"
        />
        <button
          onClick={handleUpdate}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
};
