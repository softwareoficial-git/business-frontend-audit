'use client';

import { useState } from 'react';
import { apiClient } from '../../lib/api';

export default function CreateEmployeeModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: () => void;
}) {
  const [nombre, setNombre] = useState('');
  const [role, setRole] = useState('EMPLEADO');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({ cmd: 'staff.create', params: { nombre, role } }),
      });
      const result = await response.json();
      if (result.success) {
        onAdd();
        onClose();
      } else {
        alert(`Error al crear: ${result.message}`);
      }
    } catch (error) {
      console.error('Error creating employee:', error);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'var(--color-background)',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          minWidth: '300px',
        }}
      >
        <h2>Nuevo Empleado</h2>
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="EMPLEADO">EMPLEADO</option>
          <option value="DUEÑO">DUEÑO</option>
        </select>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit">Crear</button>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
