'use client';

import { useState } from 'react';
import { useLoading } from '../loading/LoadingProvider';
import { auditLog } from '../../lib/auditLogger';

export default function AddProductModal({
  onClose,
  onAdd,
  productToEdit,
}: {
  onClose: () => void;
  onAdd: (product: any) => void;
  productToEdit?: any;
}) {
  const [product, setProduct] = useState(
    productToEdit || { code: '', name: '', price: '', qty: '', category: '' }
  );
  const [metadata, setMetadata] = useState<{ key: string; value: string }[]>(
    productToEdit?.metadata
      ? Object.entries(productToEdit.metadata).map(([key, value]) => ({
          key,
          value: String(value),
        }))
      : []
  );
  const { startLoading, stopLoading } = useLoading();

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
          backgroundColor: 'var(--color-background)',
          padding: '2rem',
          borderRadius: '15px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          minWidth: '300px',
        }}
      >
        <h2>{productToEdit ? 'Editar Producto' : 'Añadir Producto'}</h2>
        <input
          placeholder="Código"
          value={product.code}
          onChange={(e) => setProduct({ ...product, code: e.target.value })}
          disabled={!!productToEdit}
          required
        />
        <input
          placeholder="Nombre"
          value={product.name}
          onChange={(e) => setProduct({ ...product, name: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Precio"
          value={product.price}
          onChange={(e) => setProduct({ ...product, price: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Cantidad"
          value={product.qty}
          onChange={(e) => setProduct({ ...product, qty: e.target.value })}
          required
        />
        <input
          placeholder="Categoría"
          value={product.category}
          onChange={(e) => setProduct({ ...product, category: e.target.value })}
          required
        />

        {metadata.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              placeholder="Campo"
              value={m.key}
              onChange={(e) => handleMetadataChange(i, 'key', e.target.value)}
            />
            <input
              placeholder="Valor"
              value={m.value}
              onChange={(e) => handleMetadataChange(i, 'value', e.target.value)}
            />
          </div>
        ))}
        <button type="button" onClick={addMetadataField}>
          + Añadir Campo
        </button>
        <button type="submit">
          {productToEdit ? 'Actualizar' : 'Guardar'}
        </button>
        <button type="button" onClick={onClose}>
          Cancelar
        </button>
      </form>
    </div>
  );
}
