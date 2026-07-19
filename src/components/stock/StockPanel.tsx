'use client';

import { useState, useEffect } from 'react';
import StockCard from './StockCard';
import AddProductModal from './AddProductModal';
import { useLoading } from '../loading/LoadingProvider';

export default function StockPanel() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { startLoading, stopLoading } = useLoading();

  const loadStock = () => {
    startLoading();
    const storedProducts = localStorage.getItem('products');
    setProducts(storedProducts ? JSON.parse(storedProducts) : []);
    stopLoading();
  };

  useEffect(() => {
    loadStock();
  }, []);

  const saveStock = (newProducts: any[]) => {
    localStorage.setItem('products', JSON.stringify(newProducts));
    setProducts(newProducts);
  };

  const handleUpdate = async (product: any) => {
    startLoading();
    const newProducts = products.map((p) =>
      p.code === product.code ? product : p
    );
    saveStock(newProducts);
    stopLoading();
  };

  const handleDelete = async (code: string) => {
    startLoading();
    const newProducts = products.filter((p) => p.code !== code);
    saveStock(newProducts);
    stopLoading();
  };

  const handleAdd = async (product: any) => {
    const newProducts = [...products, product];
    saveStock(newProducts);
    setIsModalOpen(false);
  };

  const filteredProducts = (products || []).filter(
    (p: any) =>
      p?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p?.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ paddingBottom: '80px' }}>
      <input
        type="text"
        placeholder="Buscar producto..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '90%',
          margin: '1rem',
          padding: '0.5rem',
          borderRadius: '10px',
          border: '1px solid var(--color-border)',
        }}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1rem',
          padding: '1rem',
        }}
      >
        {Array.isArray(filteredProducts) &&
          filteredProducts.map((p: any) => (
            <StockCard
              key={p.code}
              product={p}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        {(!Array.isArray(filteredProducts) ||
          filteredProducts.length === 0) && (
          <p style={{ color: 'var(--color-text)' }}>
            No se encontraron productos.
          </p>
        )}
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: '85px',
          right: '1.5rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          fontSize: '2rem',
          cursor: 'pointer',
          boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        }}
      >
        +
      </button>

      {isModalOpen && (
        <AddProductModal
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}
