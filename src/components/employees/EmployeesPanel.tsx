'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';

export default function EmployeesPanel() {
  const [employees, setEmployees] = useState<any[]>([]);

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

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Empleados</h1>
      {employees.length === 0 ? (
        <p>No hay empleados registrados.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {employees.map((emp) => (
            <li key={emp.id} style={{ border: '1px solid var(--color-border)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}>
              <strong>{emp.username}</strong> - {emp.role_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
