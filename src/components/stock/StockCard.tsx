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
        className="masonry-item"
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-md)',
          backgroundColor: 'var(--color-background)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-soft)',
          transition: 'transform 0.2s',
          color: 'var(--color-text)',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-xs)',
          boxSizing: 'border-box',
          overflow: 'hidden',
          textAlign: 'left', // Alineación base
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Fila 1: Título */}
        <div style={{ width: '100%', textAlign: 'left' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Fila 2: Código */}
        <div style={{ width: '100%', textAlign: 'left' }}>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-secondary)',
              background: 'var(--color-border)',
              padding: '0.1rem 0.4rem',
              borderRadius: 'var(--radius-sm)',
              display: 'inline-block',
            }}
          >
            {product.code}
          </span>
        </div>

        {/* Fila 3: Stock y Precio */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'var(--space-xs)',
          }}
        >
          <span style={{ fontSize: '0.85rem' }}>
            Stock: <strong>{product.qty}</strong>
          </span>
          <span
            style={{
              fontWeight: 'bold',
              color: 'var(--color-primary)',
              fontSize: '0.85rem',
            }}
          >
            ${product.price}
          </span>
        </div>

        {isExpanded && (
          <div
            style={{
              marginTop: 'var(--space-md)',
              paddingTop: 'var(--space-md)',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-sm)',
            }}
          >
            <ul
              style={{
                margin: 0,
                paddingLeft: '1.2rem',
                fontSize: '0.85rem',
                color: 'var(--color-secondary)',
              }}
            >
              <li style={{ marginBottom: '0.25rem' }}>
                Categoría: <strong>{product.category || 'N/A'}</strong>
              </li>
              {Object.entries(product).map(([key, value]) => {
                // Excluimos campos base que ya mostramos
                if (['code', 'name', 'price', 'qty', 'category'].includes(key))
                  return null;
                return (
                  <li
                    key={key}
                    style={{
                      marginBottom: '0.25rem',
                      textTransform: 'capitalize',
                    }}
                  >
                    {key}: <strong>{String(value)}</strong>
                  </li>
                );
              })}
            </ul>

            <div
              style={{
                display: 'flex',
                gap: 'var(--space-sm)',
                marginTop: 'var(--space-xs)',
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  fontSize: '0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-primary)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Editar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(product.code);
                }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  fontSize: '0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-error)',
                  backgroundColor: 'var(--color-error-bg)',
                  color: 'var(--color-error)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
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
