'use client';

import { useState, useEffect } from 'react';
import { getSalesHistory } from '../../lib/api';

export default function EmployeeActivityList({ userId }: { userId?: string }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const result = await getSalesHistory();

      // LOG RAW CRUCIAL:
      console.log(
        '--- DEBUG: RESPUESTA RAW DEL SERVIDOR (sales.history) ---',
        result
      );

      if (result.success && Array.isArray(result.data)) {
        // Ordenar por fecha descendente
        const sorted = result.data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setTickets(sorted);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (tickets.length === 0) return <div>No hay ventas registradas.</div>;

  return (
    <div style={{ padding: 'var(--space-md)' }}>
      <h2>Historial de Ventas</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tickets.map((ticket: any) => {
          const items =
            ticket.items || (ticket.ticket ? ticket.ticket.items : []);
          const empleado =
            ticket.role === 'DUEÑO'
              ? 'Dueño'
              : ticket.empleado
                ? `Empleado (${ticket.empleado})`
                : 'Desconocido';

          return (
            <div
              key={ticket.id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <div
                onClick={() =>
                  setExpandedTicketId(
                    expandedTicketId === ticket.id ? null : ticket.id
                  )
                }
                style={{
                  padding: '15px',
                  cursor: 'pointer',
                  backgroundColor: '#f9f9f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>
                  <strong>ID: {ticket.id}</strong>
                </span>
                <span>
                  <strong>{empleado}</strong>
                </span>
                <span>
                  <strong>Total: ${Number(ticket.total).toFixed(2)}</strong>
                </span>
              </div>
              {expandedTicketId === ticket.id && (
                <div
                  style={{ padding: '15px 20px', borderTop: '1px solid #eee' }}
                >
                  <p>Fecha: {new Date(ticket.createdAt).toLocaleString()}</p>
                  <ul>
                    {items.map((p: any, i: number) => (
                      <li key={i}>
                        {p.name || p.producto || 'Producto'} x
                        {p.qty || p.cantidad || 0} - $
                        {Number(p.price || p.monto || 0).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
