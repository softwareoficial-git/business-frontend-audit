'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';

export default function SalesStatsWidget() {
  const [dailyStats, setDailyStats] = useState<any>(null);
  const [monthlyStats, setMonthlyStats] = useState<any>(null);
  const [patrimonio, setPatrimonio] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const dailyRes = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({ cmd: 'sales.get_daily_total', params: {} }),
      });
      const dailyData = await dailyRes.json();
      if (dailyData.success) setDailyStats(dailyData.data);

      const monthlyRes = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({ cmd: 'sales.get_monthly_summary', params: {} }),
      });
      const monthlyData = await monthlyRes.json();
      if (monthlyData.success) setMonthlyStats(monthlyData.data);

      const stockRes = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({ cmd: 'stock.list', params: {} }),
      });
      const stockData = await stockRes.json();
      if (stockData.success) {
        const total = stockData.data.reduce(
          (acc: number, p: any) => acc + (p.price || 0) * (p.qty || 0),
          0
        );
        setPatrimonio(total);
      }
    } catch (error) {
      console.error('Error fetching sales/stock stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando datos...</div>;

  return (
    <div
      style={{
        padding: 'var(--space-md)',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
      }}
    >
      <h3>Ventas y Patrimonio</h3>
      <div
        style={{
          marginBottom: 'var(--space-md)',
          padding: 'var(--space-sm)',
          background: 'var(--color-background)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <h4
          style={{
            margin: 0,
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
          }}
        >
          Patrimonio en Stock
        </h4>
        <div
          style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: 'var(--color-primary)',
          }}
        >
          ${patrimonio.toLocaleString('es-AR')}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-md)',
        }}
      >
        <div
          style={{
            padding: 'var(--space-sm)',
            background: 'var(--color-background)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h4
            style={{
              margin: 0,
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
            }}
          >
            Ventas Hoy
          </h4>
          {dailyStats && (
            <>
              <div
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: 'var(--color-success)',
                }}
              >
                ${dailyStats.dailySalesTotal.toLocaleString('es-AR')}
              </div>
              <small>{dailyStats.totalTicketsToday} tickets</small>
            </>
          )}
        </div>
        <div
          style={{
            padding: 'var(--space-sm)',
            background: 'var(--color-background)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h4
            style={{
              margin: 0,
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
            }}
          >
            Ventas Mes
          </h4>
          {monthlyStats && (
            <>
              <div
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: 'var(--color-success)',
                }}
              >
                ${monthlyStats.totalSales.toLocaleString('es-AR')}
              </div>
              <small>{monthlyStats.totalTickets} tickets</small>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
