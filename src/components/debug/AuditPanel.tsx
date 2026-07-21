'use client';

import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../../lib/api';

export default function AuditPanel({ onClose }: { onClose: () => void }) {
  const [fullAuditData, setFullAuditData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  const fetchFullAudit = async () => {
    setLoading(true);
    try {
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({
          cmd: 'staff.get_employee_activity',
          // Al no enviar userId, asumimos que el backend entiende que es el listado global.
          // Si el backend insiste en userId, habrá que ver cómo obtenerlo o si requiere un parámetro distinto.
          params: { limit: 100 },
        }),
      });
      const result = await response.json();

      if (result.success) {
        setFullAuditData(result.data || []);
      } else {
        console.error('Error en respuesta de auditoría:', result.message);
      }
    } catch (error) {
      console.error('Error fetching audit:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFullAudit();
  }, []);

  const filteredData = useMemo(() => {
    return fullAuditData.filter((event) => {
      const matchesEmployee = selectedUser
        ? event.detalle?.userId === selectedUser
        : true;
      const matchesAction = selectedType
        ? event.comando === selectedType
        : true;
      return matchesEmployee && matchesAction;
    });
  }, [fullAuditData, selectedUser, selectedType]);

  return (
    <div
      style={{
        position: 'fixed',
        top: '60px',
        right: '20px',
        width: '90vw',
        maxWidth: '800px',
        height: '80vh',
        backgroundColor: 'var(--color-background)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem',
        boxShadow: 'var(--shadow-soft)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <h2>Panel de Auditoría</h2>
        <button onClick={onClose} style={{ cursor: 'pointer' }}>
          Cerrar
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <input
          placeholder="Filtrar por UserID"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        />
        <input
          placeholder="Filtrar por Comando"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        />
        <button onClick={fetchFullAudit} disabled={loading}>
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.85rem',
          }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Fecha</th>
              <th style={{ textAlign: 'left' }}>Comando</th>
              <th style={{ textAlign: 'left' }}>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((e: any, i: number) => (
              <tr
                key={i}
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <td style={{ padding: '0.5rem' }}>
                  {new Date(e.fecha).toLocaleString()}
                </td>
                <td style={{ padding: '0.5rem' }}>{e.comando}</td>
                <td style={{ padding: '0.5rem' }}>
                  {JSON.stringify(e.detalle)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
