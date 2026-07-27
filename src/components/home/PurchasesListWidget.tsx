'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';

export default function PurchasesListWidget() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetchReorderNeeds();
  }, []);

  const fetchReorderNeeds = async () => {
    setLoading(true);
    try {
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({ cmd: 'stock.get_reorder_needs', params: {} }),
      });
      const result = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        setItems(result.data);
      }
    } catch (error) {
      console.error('Error fetching reorder needs:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsApp = () => {
    if (!phone) {
      alert('Por favor, ingresa un número de teléfono');
      return;
    }
    const message =
      `*Lista de Compras Sugerida:*\n` +
      items.map((i) => `- ${i.productName}: Queda ${i.currentQty}`).join('\n');
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (loading) return <div>Cargando sugerencias de compra...</div>;
  if (items.length === 0) return null;

  return (
    <div
      style={{
        padding: 'var(--space-md)',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
      }}
    >
      <h3>Sugerencias de Compra</h3>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          marginBottom: 'var(--space-md)',
        }}
      >
        {items.map((item: any, index: number) => (
          <li
            key={item.productId || index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '4px 0',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <span>{item.productName}</span>
            <strong style={{ color: 'var(--color-error)' }}>
              Queda: {item.currentQty}
            </strong>
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
        <input
          type="tel"
          placeholder="Teléfono (con código)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            flex: 1,
            padding: 'var(--space-xs)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
          }}
        />
        <button onClick={sendWhatsApp} className="btn-primary">
          Enviar
        </button>
      </div>
    </div>
  );
}
