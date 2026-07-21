'use client';

import { useState, useEffect } from 'react';
import { useLoading } from '../loading/LoadingProvider';
import { auditLog } from '../../lib/auditLogger';
import { apiClient } from '../../lib/api';

export default function AddProductModal({
  onClose,
  onAdd,
  productToEdit,
}: {
  onClose: () => void;
  onAdd: (product: any) => void;
  productToEdit?: any;
}) {
  const [product, setProduct] = useState({
    code: productToEdit?.code || '',
    name: productToEdit?.name || '',
    price: productToEdit?.price || '',
    qty: productToEdit?.qty || '',
    category: productToEdit?.category || '',
  });

  const [products, setProducts] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  const filteredCategories = categories.filter((c) =>
    c.toLowerCase().includes(product.category.toLowerCase())
  );

  const [metadata, setMetadata] = useState<{ key: string; value: string }[]>(
    productToEdit?.metadata
      ? Object.entries(productToEdit.metadata).map(([key, value]) => ({
          key,
          value: String(value),
        }))
      : []
  );

  const addMetadataField = () =>
    setMetadata([...metadata, { key: '', value: '' }]);

  const handleMetadataChange = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    const newMetadata = [...metadata];
    newMetadata[index][field] = value;
    setMetadata(newMetadata);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !product.code ||
      !product.name ||
      !product.price ||
      !product.qty ||
      !product.category
    ) {
      auditLog('Error: Campos obligatorios faltantes', 'error');
      return;
    }

    startLoading();
    const metaObj = metadata.reduce(
      (acc, curr) => {
        if (curr.key) acc[curr.key] = curr.value;
        return acc;
      },
      {} as Record<string, string>
    );

    const productPayload = {
      ...product,
      ...metaObj,
      price: Number(product.price),
      qty: Number(product.qty),
    };
    await onAdd(productPayload);
    stopLoading();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1100,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'var(--color-surface)',
          padding: 'var(--space-md)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-sm)',
          width: '90%',
          maxWidth: '400px',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', margin: '0 0 var(--space-sm) 0' }}>
          {productToEdit ? 'Editar Producto' : 'Añadir Producto'}
        </h2>

        {/* Código con generador */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            placeholder="Código"
            value={product.code}
            onChange={(e) => setProduct({ ...product, code: e.target.value })}
            disabled={!!productToEdit}
            required
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              boxSizing: 'border-box',
            }}
          />
          {!productToEdit && (
            <button
              type="button"
              onClick={() =>
                setProduct({
                  ...product,
                  code: Math.random()
                    .toString(36)
                    .substring(2, 10)
                    .toUpperCase(),
                })
              }
              className="btn-primary"
              style={{ padding: '0.5rem var(--space-sm)' }}
            >
              Generar
            </button>
          )}
        </div>

        <input
          placeholder="Nombre"
          value={product.name}
          onChange={(e) => setProduct({ ...product, name: e.target.value })}
          required
          style={{
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            boxSizing: 'border-box',
          }}
        />

        {/* Agrupación de precio y cantidad */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <input
            type="number"
            placeholder="Precio"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: e.target.value })}
            required
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              boxSizing: 'border-box',
              minWidth: 0,
            }}
          />
          <input
            type="number"
            placeholder="Cantidad"
            value={product.qty}
            onChange={(e) => setProduct({ ...product, qty: e.target.value })}
            required
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              boxSizing: 'border-box',
              minWidth: 0,
            }}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <input
            placeholder="Categoría"
            value={product.category}
            onChange={(e) => {
              setProduct({ ...product, category: e.target.value });
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              boxSizing: 'border-box',
            }}
          />
          {showSuggestions && filteredCategories.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                left: 0,
                right: 0,
                display: 'flex',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                zIndex: 10,
                padding: '0.25rem',
                gap: '0.5rem',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {filteredCategories.map((cat) => (
                <div
                  key={cat}
                  onClick={() => {
                    setProduct({ ...product, category: cat });
                    setShowSuggestions(false);
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    cursor: 'pointer',
                    backgroundColor: 'var(--color-background)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                  }}
                >
                  {cat}
                </div>
              ))}
            </div>
          )}
        </div>

        {metadata.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '0.5rem',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <input
              placeholder="Campo"
              value={m.key}
              onChange={(e) => handleMetadataChange(i, 'key', e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                boxSizing: 'border-box',
                minWidth: 0,
              }}
            />
            <input
              placeholder="Valor"
              value={m.value}
              onChange={(e) => handleMetadataChange(i, 'value', e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                boxSizing: 'border-box',
                minWidth: 0,
              }}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addMetadataField}
          className="btn-secondary"
        >
          + Añadir Campo
        </button>
        <button type="submit" className="btn-primary">
          {productToEdit ? 'Actualizar' : 'Guardar'}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancelar
        </button>
      </form>
    </div>
  );
}
