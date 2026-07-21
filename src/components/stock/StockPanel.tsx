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
    try {
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({
          cmd: 'stock.update',
          params: {
            code: product.code,
            ...product,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el producto');
      }

      await fetchStock();
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      alert('No se pudo actualizar el producto. Por favor, intenta de nuevo.');
    } finally {
      stopLoading();
    }
  };

  const handleDelete = async (code: string) => {
    startLoading();
    try {
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({ cmd: 'stock.delete', params: { code } }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error detallado del backend (Delete):', errorData);
        alert(`Error al eliminar: ${errorData.message || 'Error desconocido'}`);
      } else {
        await fetchStock();
      }
    } catch (error) {
      console.error('Error de red en handleDelete:', error);
    }
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        paddingBottom: '80px',
      }}
    >
      {/* Buscador Fijo */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          padding: 'var(--space-sm)',
          backgroundColor: 'var(--color-background)',
          borderBottom: '1px solid var(--color-border)',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        <input
          type="text"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: 'var(--space-sm)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text)',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Grid de tarjetas compacto sin borde de debug */}
      <div className="stock-grid">
        {Array.isArray(filteredProducts) &&
          filteredProducts.map((p: any, index: number) => (
            <StockCard
              key={`${p.code}-${index}`}
              product={p}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: '85px',
          right: '1.5rem',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          zIndex: 20,
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
