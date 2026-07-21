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

      {/* Selector Horizontal */}
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: 'var(--space-sm)',
          paddingBottom: 'var(--space-sm)',
          whiteSpace: 'nowrap',
        }}
      >
        <button
          onClick={() => setSelectedEmployeeId(null)}
          className={`sidebar-item ${selectedEmployeeId === null ? 'active' : ''}`}
          style={{ minWidth: '80px' }}
        >
          Todo
        </button>
        {employees.map((emp) => (
          <button
            key={emp.id}
            onClick={() => setSelectedEmployeeId(emp.id)}
            className={`sidebar-item ${selectedEmployeeId === emp.id ? 'active' : ''}`}
            style={{
              minWidth: 'auto',
              textAlign: 'left',
              padding: '0.5rem 1rem',
            }}
          >
            <span style={{ fontWeight: 'bold', display: 'block' }}>
              {(emp.name || emp.username || 'Sin Nombre').substring(0, 10) +
                (emp.name?.length > 10 ? '...' : '')}
            </span>
            <small
              style={{ fontSize: '0.75rem', color: 'inherit', opacity: 0.8 }}
            >
              {emp.role}
            </small>
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
          border: '1px solid var(--color-border)',
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
