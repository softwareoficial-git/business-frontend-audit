'use client';

import './SalesPanel.css';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import SearchBar from './SearchBar';
import CartList from './CartList';
import { useLoading } from '../loading/LoadingProvider';

export default function SalesPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    fetchAvailableProducts();
  }, []);

  const fetchAvailableProducts = async () => {
    try {
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({ cmd: 'stock.list', params: {} }),
      });
      const result = await response.json();
      if (result.success) setProducts(result.data);
    } catch (error) {
      console.error('Error fetching stock:', error);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p?.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const addToCart = (product: any) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.code === product.code);
      if (exists) {
        return prev.map((i) =>
          i.code === product.code ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const handleCheckout = async () => {
    startLoading();
    try {
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({
          cmd: 'sales.checkout',
          params: { items, customerId: 'CUST-1' },
        }),
      });
      const result = await response.json();
      if (result.success) {
        setItems([]);
        alert('Venta realizada con éxito');
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error(error);
    }
    stopLoading();
  };

  return (
    <div className="sales-panel">
      {/* Buscador y tarjetas flotantes */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <SearchBar onSearch={setSearchTerm} />

        {searchTerm && filteredProducts.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              maxHeight: '300px',
              overflowY: 'auto',
              background: 'var(--color-background)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-soft)',
              marginTop: '0.5rem',
              padding: '0.5rem',
              display: 'grid',
              gap: '0.5rem',
            }}
          >
            {filteredProducts.map((p) => (
              <button
                key={p.code}
                onClick={() => {
                  addToCart(p);
                  setSearchTerm('');
                }}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-background)',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: 'var(--color-text)',
                  width: '100%',
                }}
              >
                <span>{p.name}</span>
                <span>${p.price}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Carrito y Presupuesto - Tarjeta */}
      <div className="cart-budget-card">
        <CartList items={items} />
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: '1rem',
          }}
        >
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            Total: ${total.toFixed(2)}
          </p>
          <button
            onClick={handleCheckout}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            Finalizar Venta
          </button>
        </div>
      </div>
    </div>
  );
}
