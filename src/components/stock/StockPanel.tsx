'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import StockCard from './StockCard';
import AddProductModal from './AddProductModal';
import { useLoading } from '../loading/LoadingProvider';

export default function StockPanel() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    startLoading();
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
    stopLoading();
  };

  const handleUpdate = async (product: any) => {
    startLoading();
    await apiClient('/execute', {
      method: 'POST',
      body: JSON.stringify({ cmd: 'stock.add', params: product }),
    });
    fetchStock();
    stopLoading();
  };

  const handleDelete = async (code: string) => {
    startLoading();
    await apiClient('/execute', {
      method: 'POST',
      body: JSON.stringify({ cmd: 'stock.delete', params: { code } }),
    });
    fetchStock();
    stopLoading();
  };

  const handleAdd = async (product: any) => {
    await apiClient('/execute', {
      method: 'POST',
      body: JSON.stringify({ cmd: 'stock.add', params: product }),
    });
    fetchStock();
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
