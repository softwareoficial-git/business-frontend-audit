'use client';

import { useState } from 'react';
import AddProductModal from './AddProductModal';

export default function StockCard({
  product,
  onUpdate,
  onDelete,
}: {
  product: any;
  onUpdate: (product: any) => void;
  onDelete: (code: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <div
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: '15px',
          padding: '1rem',
          margin: '0.5rem',
          backgroundColor: 'var(--color-background)',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          color: 'var(--color-text)',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3>
          {product.name} ({product.code})
        </h3>
        <p>
          Cantidad: {product.qty} | Precio: ${product.price}
        </p>

        {isExpanded && (
          <div
            style={{
              marginTop: '1rem',
              borderTop: '1px solid var(--color-border)',
              paddingTop: '1rem',
            }}
          >
            <p>Categoría: {product.category}</p>
            {product.metadata &&
              Object.entries(product.metadata).map(([key, value]) => (
                <p key={key}>
                  <strong>{key}:</strong> {String(value)}
                </p>
              ))}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                Editar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(product.code);
                }}
                style={{ color: 'var(--color-error)' }}
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>
      {isEditing && (
        <AddProductModal
          productToEdit={product}
          onClose={() => setIsEditing(false)}
          onAdd={(updatedProduct) => {
            onUpdate(updatedProduct);
            setIsEditing(false);
          }}
        />
      )}
    </>
  );
}
