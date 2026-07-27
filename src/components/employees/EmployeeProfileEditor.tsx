'use client';

import { useState } from 'react';
import { apiClient } from '../../lib/api';

interface EmployeeProfileEditorProps {
  employee: any;
  onUpdate: () => void;
}

export default function EmployeeProfileEditor({
  employee,
  onUpdate,
}: EmployeeProfileEditorProps) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword) return;
    setLoading(true);
    try {
      await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({
          cmd: 'staff.change_password',
          params: { userId: employee.id, newPassword },
        }),
      });
      alert('Contraseña cambiada exitosamente.');
      setNewPassword('');
      setShowPasswordInput(false);
      onUpdate();
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error al cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!confirm(`¿Estás seguro de eliminar a ${employee.name}?`)) return;
    setDeleteLoading(true);
    try {
      await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({
          cmd: 'staff.delete',
          params: { userId: employee.id },
        }),
      });
      alert('Empleado eliminado exitosamente.');
      onUpdate(); // Para refrescar la lista y deseleccionar al empleado
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Error al eliminar el empleado.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ padding: 'var(--space-md)' }}>
      <h4>Perfil de {employee.name}</h4>
      <p>
        <strong>ID:</strong> {employee.id}
      </p>
      <p>
        <strong>Usuario:</strong> {employee.username}
      </p>
      <p>
        <strong>Rol:</strong> {employee.role}
      </p>
      <p>
        <strong>Fecha de Ingreso:</strong>{' '}
        {new Date(employee.joinedAt).toLocaleDateString()}
      </p>

      <div
        style={{
          marginTop: 'var(--space-md)',
          borderTop: '1px solid var(--color-border)',
          paddingTop: 'var(--space-md)',
        }}
      >
        <h5>Acciones de Seguridad</h5>
        <button
          onClick={() => setShowPasswordInput(!showPasswordInput)}
          style={{ marginRight: 'var(--space-sm)', padding: 'var(--space-sm)' }}
        >
          {showPasswordInput ? 'Cancelar' : 'Cambiar Contraseña'}
        </button>

        {showPasswordInput && (
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-sm)',
              marginTop: 'var(--space-sm)',
            }}
          >
            <input
              type="password"
              placeholder="Nueva Contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ flexGrow: 1 }}
            />
            <button onClick={handleChangePassword} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}

        <button
          onClick={handleDeleteEmployee}
          disabled={deleteLoading}
          style={{
            background: 'var(--color-error)',
            color: 'white',
            padding: 'var(--space-sm)',
            marginTop: 'var(--space-md)',
          }}
        >
          {deleteLoading ? 'Eliminando...' : 'Eliminar Empleado'}
        </button>
      </div>
    </div>
  );
}
