'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';

export default function SalesStatsWidget() {
  const [dailyStats, setDailyStats] = useState<any>(null);
  const [monthlyStats, setMonthlyStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      // Obtener ventas del día reales
      const dailyRes = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({ cmd: 'sales.get_daily_total', params: {} }),
      });
      const dailyData = await dailyRes.json();
      if (dailyData.success) setDailyStats(dailyData.data);

      // Obtener resumen mensual real
      const monthlyRes = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({ cmd: 'sales.get_monthly_summary', params: {} }),
      });
      const monthlyData = await monthlyRes.json();
      if (monthlyData.success) setMonthlyStats(monthlyData.data);
    } catch (error) {
      console.error('Error fetching sales stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando estadísticas reales...</div>;

  return (
    <div
      style={{
        padding: 'var(--space-md)',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
      }}
    >
      <h3>Ventas del Negocio</h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-md)',
        }}
      >
        <div
          style={{
            padding: 'var(--space-md)',
            background: 'var(--color-background)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h4
            style={{
              margin: '0 0 var(--space-xs) 0',
              fontSize: '0.9rem',
              color: 'var(--color-text-muted)',
            }}
          >
            Ventas Hoy
          </h4>
          {dailyStats ? (
            <>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                ${dailyStats.dailySalesTotal.toLocaleString('es-AR')}
              </div>
              <small>{dailyStats.totalTicketsToday} tickets hoy</small>
            </>
          ) : (
            <p>Cargando...</p>
          )}
        </div>

        <div
          style={{
            padding: 'var(--space-md)',
            background: 'var(--color-background)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h4
            style={{
              margin: '0 0 var(--space-xs) 0',
              fontSize: '0.9rem',
              color: 'var(--color-text-muted)',
            }}
          >
            Ventas Mes
          </h4>
          {monthlyStats ? (
            <>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                ${monthlyStats.totalSales.toLocaleString('es-AR')}
              </div>
              <small>{monthlyStats.totalTickets} tickets en el mes</small>
            </>
          ) : (
            <p>Cargando...</p>
          )}
        </div>
      </div>

      {monthlyStats?.topProducts && monthlyStats.topProducts.length > 0 && (
        <div style={{ marginTop: 'var(--space-md)' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: 'var(--space-sm)' }}>
            Productos más vendidos
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {monthlyStats.topProducts.slice(0, 3).map((p: any, i: number) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                  padding: '4px 0',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <span>{p.name}</span>
                <strong>{p.qty} un.</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
