'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';

export default function EmployeeActivityModal({
  employee,
  onClose,
}: {
  employee: any;
  onClose: () => void;
}) {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, [employee.id]);

  const fetchActivity = async () => {
    try {
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({
          cmd: 'staff.get_employee_activity',
          params: { userId: employee.id },
        }),
      });
      const result = await response.json();
      if (result.success) setTimeline(result.data.timeline || []);
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
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
      <div
        style={{
          backgroundColor: 'var(--color-background)',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          minWidth: '400px',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <h2>Actividad: {employee.username}</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {timeline.map((event: any, index: number) => (
              <li
                key={index}
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  padding: '0.5rem 0',
                }}
              >
                <small>{new Date(event.timestamp).toLocaleString()}</small>
                <p style={{ margin: '0.2rem 0' }}>{event.action}</p>
              </li>
            ))}
          </ul>
        )}
        <button onClick={onClose} style={{ marginTop: '1rem' }}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
