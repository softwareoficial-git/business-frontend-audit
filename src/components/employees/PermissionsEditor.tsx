'use client';

import { useState } from 'react';
import { apiClient } from '../../lib/api';

interface PermissionsEditorProps {
  employee: any;
  onUpdate: () => void;
}

// Permisos restringidos a solo lo necesario para un empleado
const OPERATIONAL_PERMISSIONS = {
  'sales.checkout': {
    label: 'Realizar Ventas',
    desc: 'Permite procesar ventas',
  },
  'stock.update_qty': {
    label: 'Editar Stock',
    desc: 'Permite modificar inventario',
  },
};

export default function PermissionsEditor({
  employee,
  onUpdate,
}: PermissionsEditorProps) {
  const [permissions, setPermissions] = useState<string[]>(
    employee.permissions || []
  );
  const [loading, setLoading] = useState(false);

  const togglePermission = (perm: string) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const savePermissions = async () => {
    setLoading(true);
    try {
      await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({
          cmd: 'staff.update_permissions',
          params: { userId: employee.id, permissions },
        }),
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 'var(--space-md)', border: '2px dashed red' }}>
      <h4>Permisos operativos (Staff)</h4>
      <div
        style={{
          display: 'grid',
          gap: 'var(--space-sm)',
          marginTop: 'var(--space-sm)',
        }}
      >
        {Object.entries(OPERATIONAL_PERMISSIONS).map(
          ([key, { label, desc }]) => (
            <label
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={permissions.includes(key)}
                onChange={() => togglePermission(key)}
              />
              <div>
                <div style={{ fontWeight: 600 }}>{label}</div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {desc}
                </div>
              </div>
            </label>
          )
        )}
      </div>
      <button
        onClick={savePermissions}
        disabled={loading}
        style={{
          marginTop: 'var(--space-md)',
          width: '100%',
          padding: 'var(--space-sm)',
        }}
      >
        {loading ? 'Guardando...' : 'Guardar Permisos'}
      </button>
    </div>
  );
}
