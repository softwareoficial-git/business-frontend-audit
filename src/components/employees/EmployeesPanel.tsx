'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import EmployeeCard from './EmployeeCard';
import CreateEmployeeModal from './CreateEmployeeModal';
import EditPermissionsModal from './EditPermissionsModal';

export default function EmployeesPanel() {
  const [employees, setEmployees] = useState<any[]>([]);
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
      if (result.success) setEmployees(result.data.usuarios || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('¿Estás seguro de eliminar este empleado?')) return;
    try {
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({ cmd: 'staff.delete', params: { userId } }),
      });
      const result = await response.json();
      if (result.success) {
        fetchEmployees();
      } else {
        alert(`Error al eliminar: ${result.message}`);
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Error de red al eliminar el empleado.');
    }
  };

  return (
    <div style={{ padding: 'var(--space-md)' }}>
      <h1 style={{ marginBottom: 'var(--space-md)' }}>Gestión de Empleados</h1>
      {employees.length === 0 ? (
        <p>No hay empleados registrados.</p>
      ) : (
        <div className="stock-grid">
          {employees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              onDelete={handleDelete}
              onUpdatePermissions={(emp) => setEditingEmployee(emp)}
            />
          ))}
        </div>
      )}

      <button
        onClick={() => setIsCreateModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: '85px',
          right: '1.5rem',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          zIndex: 20,
        }}
      >
        +
      </button>

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
