'use client';

import './SalesPanel.css';
import { useState } from 'react';
import { MOCK_PRODUCTS } from './data';
import SearchBar from './SearchBar';
import CartList from './CartList';
import CategoryGrid from './CategoryGrid';
import QuickProductModal from './QuickProductModal';
import { useLoading } from '../loading/LoadingProvider';

export default function SalesPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    'cat1'
  );
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const { startLoading, stopLoading } = useLoading();

  const handleAddToCart = (product: any, qty: number) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.code === product.code);
      if (exists) {
        return prev.map((i) =>
          i.code === product.code ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...product, qty }];
    });
    setSelectedProduct(null);
  };

  const handleCheckout = async () => {
    startLoading();
    // Lógica original de checkout mantenida
    setTimeout(() => {
      setItems([]);
      alert('Venta realizada con éxito');
      stopLoading();
    }, 1000);
  };

  const currentProducts = selectedCategoryId
    ? (MOCK_PRODUCTS as any)[selectedCategoryId] || []
    : [];
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="sales-panel">
      <div className="main-content">
        <SearchBar onSearch={setSearchTerm} />

        <CategoryGrid
          onSelectCategory={setSelectedCategoryId}
          selectedCategoryId={selectedCategoryId}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 'var(--space-md)',
            padding: 'var(--space-md)',
          }}
        >
          {currentProducts.map((p: any) => (
            <button
              key={p.code}
              onClick={() => setSelectedProduct(p)}
              style={{
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-background)',
                color: 'var(--color-text)',
                cursor: 'pointer',
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

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
            style={{
              width: '100%',
              marginTop: '0.5rem',
              padding: 'var(--space-sm)',
            }}
          >
            Finalizar Venta
          </button>
        </div>
      </div>

      <QuickProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAdd={(qty) => handleAddToCart(selectedProduct, qty)}
      />
    </div>
  );
}
