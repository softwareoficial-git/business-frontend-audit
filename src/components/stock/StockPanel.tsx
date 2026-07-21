'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import { LocalStorageSync } from '../../lib/localStorageSync'; // Importar servicio
import StockCard from './StockCard';
import AddProductModal from './AddProductModal';
import { useLoading } from '../loading/LoadingProvider';
import SearchBar from '../sales/SearchBar';

const STOCK_STORAGE_KEY = 'stock_data';

export default function StockPanel() {
  const [products, setProducts] = useState(
    () => LocalStorageSync.getData(STOCK_STORAGE_KEY) || []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    // No usamos startLoading() aquí para permitir carga silenciosa
    try {
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({ cmd: 'stock.list', params: {} }),
      });
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
        LocalStorageSync.saveData(STOCK_STORAGE_KEY, result.data); // Persistir
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
    }
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
        <SearchBar onSearch={setSearchTerm} />
      </div>

      {/* Grid de tarjetas compacto */}
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
