'use client';

import './EmployeesPanel.css';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import EmployeeActivityList from './EmployeeActivityList';

export default function EmployeesPanel() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );

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
      <h2>Personal</h2>

      {/* Selector de Empleados */}
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
            padding: 'var(--space-sm) var(--space-md)',
            borderRadius: '50px',
            border: `1px solid ${selectedEmployeeId === null ? 'var(--color-primary)' : 'var(--color-border)'}`,
            cursor: 'pointer',
          }}
        >
          Todo el personal
        </button>
        {employees.map((emp) => (
          <button
            key={emp.id}
            onClick={() => setSelectedEmployeeId(emp.id)}
            style={{
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: '50px',
              border: `1px solid ${selectedEmployeeId === emp.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
              cursor: 'pointer',
            }}
          >
            <span style={{ fontWeight: 600 }}>{emp.name || emp.username}</span>
          </button>
        ))}
      </div>

      {/* Historial de Ventas */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          paddingBottom: '100px',
        }}
      >
        <EmployeeActivityList userId={selectedEmployeeId || undefined} />
      </div>
    </div>
  );
}
