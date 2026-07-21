'use client';

import './SalesPanel.css';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import SearchBar from './SearchBar';
import CartList from './CartList';
import CategoryGrid from './CategoryGrid';
import QuickProductModal from './QuickProductModal';
import { useLoading } from '../loading/LoadingProvider';

export default function SalesPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Extraer categorías únicas dinámicamente de los productos cargados
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  ).map((name) => ({ id: name, name, icon: 'sales' }));

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    categories.length > 0 ? categories[0].id : null
  );

  // Sincronizar selectedCategoryId si las categorías cambian
  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
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
    try {
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({
          cmd: 'sales.checkout',
          params: {
            items,
            customerId: 'CUST-1',
            clientTimestamp: new Date().toISOString(),
            client_request_id: crypto.randomUUID(), // Asegurar idempotencia
          },
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

  const filteredProducts = searchTerm
    ? products.filter((p) => {
        const term = searchTerm.toLowerCase();
        const matchesNameOrCode =
          (p?.name?.toLowerCase() || '').includes(term) ||
          (p?.code?.toLowerCase() || '').includes(term);

        // Buscar también en los valores de los metadatos
        const matchesMetadata = p.metadata
          ? Object.values(p.metadata).some((val) =>
              String(val).toLowerCase().includes(term)
            )
          : false;

        return matchesNameOrCode || matchesMetadata;
      })
    : [];

  const currentProducts = selectedCategoryId
    ? products.filter((p) => p.category === selectedCategoryId)
    : [];

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="sales-panel">
      {/* Capa de enfoque cuando hay búsqueda activa */}
      {searchTerm && (
        <div
          onClick={() => setSearchTerm('')}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 5,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Buscador */}
      <div className="search-area">
        <div style={{ position: 'relative' }}>
          <SearchBar onSearch={setSearchTerm} />

          {/* Resultados Flotantes */}
          {searchTerm && filteredProducts.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                maxHeight: '40vh',
                overflowY: 'auto',
                background: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                marginTop: 'var(--space-sm)',
                padding: 'var(--space-sm)',
                display: 'grid',
                gap: 'var(--space-xs)',
              }}
            >
              {filteredProducts.map((p: any, index: number) => (
                <button
                  key={`${p.code || 'unknown'}-${index}`}
                  onClick={() => {
                    setSelectedProduct(p);
                    setSearchTerm('');
                  }}
                  style={{
                    padding: 'var(--space-md)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-background)',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'var(--color-text)',
                    width: '100%',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontWeight: 'bold' }}>{p.name}</span>
                  <span style={{ color: 'var(--color-primary)' }}>
                    ${p.price}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="categories-area">
        <CategoryGrid
          categories={categories}
          onSelectCategory={setSelectedCategoryId}
          selectedCategoryId={selectedCategoryId}
        />
      </div>

      <div className="products-area">
        {currentProducts.map((p: any) => (
          <button
            key={p.code}
            onClick={() => handleAddToCart(p, 1)}
            style={{
              padding: '0.4rem 0.6rem',
              borderRadius: '16px', // Borde redondeado suave
              border: '2px solid orange', // DEBUG
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column', // Vertical para nombre y info
              justifyContent: 'center',
              textAlign: 'left',
              boxShadow: 'var(--shadow-soft)',
              fontSize: '0.75rem',
              height: '60px', // Doble de altura aprox
              margin: '0.2rem 0',
              minWidth: '15ch', // Ancho mínimo consistente de 15 caracteres
            }}
          >
            <span
              style={{
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {p.name}
            </span>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '0.2rem',
              }}
            >
              <span style={{ color: 'var(--color-secondary)' }}>
                {p.unit || 'u'}
              </span>
              <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                ${p.price.toFixed(0)}
              </span>
            </div>
          </button>
        ))}
      </div>
      <div className="cart-budget-card">
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <CartList items={items} />
        </div>
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: 'var(--space-md)',
            marginTop: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-md)',
            }}
          >
            <span
              style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}
            >
              Total:
            </span>
            <span
              style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: 'var(--color-primary)',
              }}
            >
              ${total.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            className="btn-primary"
            style={{
              width: '100%',
              fontSize: '1rem',
            }}
          >
            Finalizar Venta
          </button>
        </div>
      </div>
    </div>
  );
}
