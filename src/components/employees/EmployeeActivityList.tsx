'use client';

import { useState, useEffect } from 'react';
import { getSalesSummary } from '../../lib/api';

export default function EmployeeActivityList({ userId }: { userId?: string }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchSummary();
  }, [userId]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const result = await getSalesSummary();
      if (result.success && result.summary?.tickets) {
        // Mapear tickets para iteración fácil
        const ticketsArray = Object.entries(result.summary.tickets).map(([id, details]: any) => ({
          id,
          ...details
        }));
        setTickets(ticketsArray);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Error fetching sales summary:', error);
      setTickets([]);
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

  if (loading) return <div style={{ padding: 'var(--space-md)' }}>Cargando...</div>;

  return (
    <div style={{ padding: 'var(--space-md)' }}>
      <h2>Historial de Tickets</h2>
      {tickets.length === 0 ? (
        <p>No hay ventas registradas en las últimas 24 horas.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
              }}
            >
              <div
                onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
                style={{
                  padding: 'var(--space-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  backgroundColor: expandedId === ticket.id ? 'var(--color-background)' : 'transparent',
                }}
              >
                <div>
                  <span style={{ fontWeight: 'bold' }}>Ticket: {ticket.id}</span>
                  <small style={{ display: 'block' }}>{formatDate(ticket.fecha)}</small>
                </div>
                <span style={{ fontWeight: '800', color: 'var(--color-primary)' }}>
                  ${ticket.total_ticket.toFixed(2)}
                </span>
              </div>
              
              {expandedId === ticket.id && (
                <div style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--color-border)', fontSize: '0.9rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Producto</th>
                        <th style={{ textAlign: 'center' }}>Cant.</th>
                        <th style={{ textAlign: 'right' }}>Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticket.productos.map((prod: any, idx: number) => (
                        <tr key={idx}>
                          <td>{prod.producto}</td>
                          <td style={{ textAlign: 'center' }}>{prod.cantidad}</td>
                          <td style={{ textAlign: 'right' }}>${prod.monto.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
