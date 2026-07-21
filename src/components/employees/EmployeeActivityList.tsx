'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';

export default function EmployeeActivityList({ userId }: { userId?: string }) {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchActivity();
  }, [userId]);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const params = userId ? { userId } : {};
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({ cmd: 'staff.get_employee_activity', params }),
      });
      const result = await response.json();

      if (result.success) {
        setTimeline(Array.isArray(result.data) ? result.data : []);
      } else {
        console.error('Error fetching activity:', result.message);
        setTimeline([]);
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
      setTimeline([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: any) => {
    if (!dateStr) return 'Fecha no disp.';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? 'Fecha inválida'
      : `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDetails = (event: any) => {
    const cmd = event.command || '';
    const payload = event.payload || {};

    // 1. Identificar Ventas
    if (cmd === 'sales.checkout' || cmd === 'sales.create' || payload.items) {
      return {
        action: 'Venta realizada',
        details: Array.isArray(payload.items)
          ? payload.items.map((i: any) => i.name).join(', ')
          : 'Productos vendidos',
        value: `$${payload.total || '0'}`,
        isSale: true,
      };
    }

    // 2. Identificar Stock
    if (
      cmd === 'stock.add' ||
      (cmd === 'USER:update-path' && payload.path?.startsWith('stock'))
    ) {
      return {
        action: 'Actualización de stock',
        details: payload.value?.name || payload.name || 'Producto',
        value: `Precio: $${payload.value?.price || payload.price || '-'}`,
        isSale: false,
      };
    }

    // 3. Empleados
    if (cmd === 'staff.create') {
      return {
        action: 'Nuevo empleado',
        details: payload.nombre || '',
        value: '',
        isSale: false,
      };
    }

    return null;
  };

  if (loading)
    return (
      <div style={{ padding: 'var(--space-md)' }}>Cargando actividades...</div>
    );

  return (
    <div style={{ padding: 'var(--space-md)' }}>
      <h2>{userId ? 'Actividad del empleado' : 'Actividad General'}</h2>
      {timeline.filter((e) => formatDetails(e) !== null).length === 0 ? (
        <p>No hay actividad de negocio registrada.</p>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
          }}
        >
          {timeline
            .filter((e) => formatDetails(e) !== null)
            .map((event: any, index: number) => {
              const data = formatDetails(event);
              const isSale = data?.isSale;
              return (
                <li
                  key={event.id || index}
                  style={{
                    backgroundColor: isSale
                      ? '#f0fdf4'
                      : 'var(--color-surface)',
                    border: isSale
                      ? '1px solid #bbf7d0'
                      : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-md)',
                    cursor: isSale ? 'pointer' : 'default',
                    boxShadow: 'var(--shadow-card)',
                  }}
                  onClick={() => isSale && toggleExpand(event.id || index)}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span
                        style={{
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          color: isSale ? '#166534' : 'var(--color-text)',
                        }}
                      >
                        {data?.action}
                      </span>
                      <span
                        style={{
                          fontSize: '0.9rem',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {data?.details}
                      </span>
                      <small
                        style={{
                          color: 'var(--color-secondary)',
                          fontWeight: 'var(--font-weight-medium)',
                        }}
                      >
                        {event.user_name || 'Sistema'}
                      </small>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          display: 'block',
                          fontWeight: '800',
                          fontSize: '1.1rem',
                          color: isSale ? '#166534' : 'var(--color-primary)',
                        }}
                      >
                        {data?.value}
                      </span>
                      <small style={{ color: 'var(--color-text-muted)' }}>
                        {formatDate(event.created_at || event.timestamp)}
                      </small>
                    </div>
                  </div>

                  {isSale && expandedId === (event.id || index) && (
                    <div
                      style={{
                        marginTop: 'var(--space-md)',
                        borderTop: '1px solid #bbf7d0',
                        paddingTop: 'var(--space-sm)',
                      }}
                    >
                      <h4
                        style={{
                          margin: '0 0 var(--space-xs) 0',
                          fontSize: '0.9rem',
                        }}
                      >
                        Detalle de productos:
                      </h4>
                      {event.payload.items?.map((item: any, i: number) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.9rem',
                            marginBottom: '0.2rem',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          <span>
                            {item.qty}x {item.name}
                          </span>
                          <span>${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
