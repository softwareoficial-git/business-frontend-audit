'use client';

import './EmployeesPanel.css';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import CreateEmployeeModal from './CreateEmployeeModal';
import EditPermissionsModal from './EditPermissionsModal';
import EmployeeActivityList from './EmployeeActivityList';

export default function EmployeesPanel() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({ cmd: 'staff.list', params: {} }),
      });
      const result = await response.json();
      // Ajuste drástico: inspeccionar toda la respuesta
      console.log('Result Full:', result);
      // Asumimos que result.data ya es el array directamente basado en reportes anteriores
      const staffList = Array.isArray(result.data)
        ? result.data
        : result.data?.usuarios || [];
      setEmployees(staffList);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  };

  return (
    <div
      style={{
        padding: 'var(--space-md)',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2>Personal</h2>
        <button
          className="btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + Nuevo Empleado
        </button>
      </div>

      {/* Selector de Píldoras (Estilo Categorías) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'auto',
          gap: 'var(--space-sm)',
          padding: 'var(--space-sm)',
          scrollbarWidth: 'none',
        }}
      >
        <button
          onClick={() => setSelectedEmployeeId(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            padding: 'var(--space-sm) var(--space-md)',
            borderRadius: '50px',
            border: `1px solid ${selectedEmployeeId === null ? 'var(--color-primary)' : 'var(--color-border)'}`,
            background: 'var(--color-background)',
            color:
              selectedEmployeeId === null
                ? 'var(--color-primary)'
                : 'var(--color-text)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <span>Todo el personal</span>
        </button>
        {employees.map((emp) => (
          <button
            key={emp.id}
            onClick={() => setSelectedEmployeeId(emp.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: '50px',
              border: `1px solid ${selectedEmployeeId === emp.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: 'var(--color-background)',
              color:
                selectedEmployeeId === emp.id
                  ? 'var(--color-primary)'
                  : 'var(--color-text)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontWeight: 600 }}>{emp.name || emp.username}</span>
          </button>
        ))}
      </div>

      {/* Área Principal */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          paddingBottom: '100px', // Espacio para el Dock
        }}
      >
        <EmployeeActivityList userId={selectedEmployeeId || undefined} />
      </div>

      {isCreateModalOpen && (
        <CreateEmployeeModal
          onClose={() => setIsCreateModalOpen(false)}
          onAdd={fetchEmployees}
        />
      )}

      {editingEmployee && (
        <EditPermissionsModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onUpdate={fetchEmployees}
        />
      )}
    </div>
  );
}
