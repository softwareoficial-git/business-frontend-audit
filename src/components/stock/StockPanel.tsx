'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import { LocalStorageSync } from '../../lib/localStorageSync'; // Importar servicio
import StockCard from './StockCard';
import AddProductModal from './AddProductModal';
import { useLoading } from '../loading/LoadingProvider';
import SearchBar from '../sales/SearchBar';
import { useTour } from '../tour/TourProvider';
import { searchProducts } from '../../lib/searchUtils';

const STOCK_STORAGE_KEY = 'stock_data';

export default function StockPanel() {
  const [products, setProducts] = useState(
    () => LocalStorageSync.getData(STOCK_STORAGE_KEY) || []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scannedCode, setScannedCode] = useState<any | null>(null);
  const { startLoading, stopLoading } = useLoading();
  const { triggerEvent } = useTour();

  useEffect(() => {
    fetchStock();
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.type === 'BARCODE_SCANNED') {
          const code = data.code;
          const existingProduct = products.find((p: any) => p.code === code);

          if (existingProduct) {
            setScannedCode(existingProduct);
          } else {
            setScannedCode({ code });
          }
          setIsModalOpen(true);
        }
      } catch (e) {
        console.error('Error parsing message from RN:', e);
      }
    };

    window.addEventListener('message', handleMessage);
    // Para entornos WebView
    (window as any).document.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      (window as any).document.removeEventListener('message', handleMessage);
    };
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
    triggerEvent('product_saved');
    fetchStock();
    setIsModalOpen(false);
  };

  const filteredProducts = searchProducts(products || [], searchTerm);

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
        <SearchBar onSearch={setSearchTerm} products={products} />
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
          onClose={() => {
            setIsModalOpen(false);
            setScannedCode(null);
          }}
          onAdd={handleAdd}
          productToEdit={
            scannedCode && typeof scannedCode === 'object'
              ? scannedCode
              : scannedCode
                ? { code: scannedCode }
                : undefined
          }
        />
      )}
    </div>
  );
}
