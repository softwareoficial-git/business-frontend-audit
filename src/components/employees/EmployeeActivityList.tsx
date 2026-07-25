'use client';

import { useState, useEffect } from 'react';
import { getSalesSummary } from '../../lib/api';

export default function EmployeeActivityList({ userId }: { userId?: string }) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);

  useEffect(() => {
    fetchSummary();
  }, [userId]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const result = await getSalesSummary();
      // Mapeo según la nueva estructura de la documentación
      if (result.success && result.data?.summary) {
        setReport(result.data.summary);
      } else {
        setReport(null);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!report) return <div>No hay ventas registradas.</div>;

  const employees = Object.entries(report.detalle_por_empleado || {});

  return (
    <div style={{ padding: 'var(--space-md)' }}>
      <h2>Resumen de Ventas (24h)</h2>
      <p style={{ fontWeight: 'bold' }}>Total General: ${report.total_ventas_24h}</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {employees.map(([empName, details]: any) => (
          <div key={empName} style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
            <div 
              onClick={() => setExpandedEmployee(expandedEmployee === empName ? null : empName)}
              style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#f9f9f9' }}
            >
               <strong>Empleado: {empName} - Total: ${details.total_empleado.toFixed(2)}</strong>
            </div>
            {expandedEmployee === empName && (
               <ul style={{ padding: '10px 20px' }}>
                 {details.productos.map((p: any, i: number) => (
                   <li key={i}>{p.producto} x{p.cantidad} - ${p.monto.toFixed(2)}</li>
                 ))}
               </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
