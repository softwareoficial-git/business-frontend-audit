'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';

export default function TopProductsWidget() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({ cmd: 'stock.list', params: {} }),
      });
      const data = await res.json();
      if (data.success) setProducts(data.data);
    };
    fetch();
  }, []);

  if (products.length === 0) return null;

  const topProducts = [...products]
    .sort((a, b) => (b.qty || 0) - (a.qty || 0))
    .slice(0, 5);

  return (
    <div
      style={{
        padding: 'var(--space-md)',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
      }}
    >
      <h3>Productos más vendidos</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {topProducts.map((p: any) => (
          <li
            key={p.code}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
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
  );
}
