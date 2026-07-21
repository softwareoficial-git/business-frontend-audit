'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';

export default function EmployeeActivityList({ userId }: { userId?: string }) {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

      if (result.success && Array.isArray(result.data)) {
        // --- PROCESAMIENTO: Agrupar Ventas ---
        const salesMap: Record<string, any> = {};
        const rawEvents = result.data;

        rawEvents.forEach((event) => {
          const detalle = event.detalle || event.payload || {};
          const cmd = event.comando || event.command || '';
          const path = detalle.path || '';

          if (cmd === 'USER:push-item') {
            const saleId = detalle.item?.sale_id || detalle.item?.id;
            if (saleId) {
              if (!salesMap[saleId]) {
                salesMap[saleId] = {
                  id: saleId,
                  items: [],
                  fecha: null,
                  total: 0,
                };
              }
              if (path === 'sale_items') {
                salesMap[saleId].items.push({
                  name: detalle.item.product_code, // Ajustar si hay nombre
                  qty: detalle.item.qty || 1,
                  price: detalle.item.price || 0,
                });
                salesMap[saleId].total +=
                  detalle.item.price * (detalle.item.qty || 1);
              }
              if (path === 'sales_orders') {
                salesMap[saleId].fecha = detalle.item.createdAt;
              }
            }
          }
        });

        setTimeline(Object.values(salesMap));
      } else {
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

  if (loading)
    return <div style={{ padding: 'var(--space-md)' }}>Cargando...</div>;

  return (
    <div style={{ padding: 'var(--space-md)' }}>
      <h2>Ventas realizadas</h2>
      {timeline.length === 0 ? (
        <p>No hay ventas registradas.</p>
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
          {timeline.map((sale) => (
            <li
              key={sale.id}
              style={{
                backgroundColor: 'var(--color-success-bg)',
                border: '1px solid #bbf7d0',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-md)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontWeight: 'bold' }}>Venta: {sale.id}</span>
                  <small style={{ display: 'block' }}>
                    {sale.items.map((i: any) => i.name).join(', ')}
                  </small>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: '800', display: 'block' }}>
                    ${sale.total.toFixed(2)}
                  </span>
                  <small>{formatDate(sale.fecha)}</small>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
