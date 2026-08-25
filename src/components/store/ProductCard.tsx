'use client';
import React, { useState } from 'react';
import { ImageWithFallback } from '../ImageWithFallback';

export function ProductCard({
  product,
  toggleExpand,
  expanded,
  addToCart,
  editable = false,
  onDiscountChange,
}: {
  product: any;
  toggleExpand: (id: string) => void;
  expanded: boolean;
  addToCart: any;
  editable?: boolean;
  onDiscountChange?: (discount: string) => void;
}) {
  let images = [];
  try {
    // 1. Intentar desde metadata
    if (product.metadata && product.metadata.images) {
      if (typeof product.metadata.images === 'string') {
        images = JSON.parse(product.metadata.images);
      } else if (Array.isArray(product.metadata.images)) {
        images = product.metadata.images;
      }
    }
    // 2. Si no hay, intentar desde la raíz del producto
    if (images.length === 0 && product.images) {
      if (typeof product.images === 'string') {
        images = JSON.parse(product.images);
      } else if (Array.isArray(product.images)) {
        images = product.images;
      }
    }
  } catch (e) {
    console.error('Error parsing images', e);
  }

  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % (images.length || 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex(
      (prev) => (prev - 1 + (images.length || 1)) % (images.length || 1)
    );
  };

  return (
    <div
      className="card"
      style={{
        padding: '1rem',
        cursor: 'pointer',
        border:
          product.metadata?.is_offer === 'true'
            ? '2px solid var(--color-secondary)'
            : '1px solid var(--color-border)',
      }}
      onClick={() => toggleExpand(product.id)}
    >
      {product.metadata?.is_offer === 'true' && (
        <div
          style={{
            background: 'var(--color-secondary)',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            marginBottom: '8px',
          }}
        >
          {editable ? (
            <input
              type="number"
              value={product.metadata.discount_percent || '10'}
              onChange={(e) => onDiscountChange?.(e.target.value)}
              style={{
                width: '40px',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontWeight: 'bold',
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            `OFERTA: ${product.metadata.discount_percent}% OFF`
          )}
        </div>
      )}
      <div style={{ position: 'relative', width: '100%', height: '150px' }}>
        <ImageWithFallback
          src={images[currentImgIndex] || '/placeholder-product.png'}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              style={{
                position: 'absolute',
                left: '5px',
                top: '50%',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                padding: '5px 10px',
              }}
            >
              &lt;
            </button>
            <button
              onClick={nextImage}
              style={{
                position: 'absolute',
                right: '5px',
                top: '50%',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                padding: '5px 10px',
              }}
            >
              &gt;
            </button>
          </>
        )}
      </div>
      <h3>{product.name}</h3>
      <p>${product.price}</p>

      {/* Etiquetas en tarjeta */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          marginTop: '6px',
        }}
      >
        {product.category && (
          <span
            style={{
              fontSize: '0.65rem',
              padding: '2px 5px',
              borderRadius: '4px',
              background: 'var(--color-background-muted)',
            }}
          >
            {product.category.split('/').pop()}
          </span>
        )}
        {product.metadata &&
          Object.entries(product.metadata)
            .filter(([key, value]) => {
              const lowerKey = key.toLowerCase();
              const valStr = String(value);
              // Filtro agresivo: excluir campos técnicos, URLs y JSONs de imágenes
              return (
                !lowerKey.includes('image') &&
                !lowerKey.includes('offer') &&
                !lowerKey.includes('discount') &&
                !valStr.toLowerCase().includes('http') &&
                !valStr.startsWith('[') &&
                valStr.trim() !== ''
              );
            })
            .slice(0, 3)
            .map(([key, value], i: number) => (
              <span
                key={i}
                style={{
                  fontSize: '0.65rem',
                  padding: '2px 5px',
                  borderRadius: '4px',
                  background: 'var(--color-primary-light)',
                }}
              >
                {String(value).split(',')[0]}
              </span>
            ))}
      </div>

      {product.qty > 0 && (
        <button
          style={{
            width: '100%',
            padding: '0.3rem',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            marginTop: '0.5rem',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            addToCart({
              code: product.id,
              name: product.name,
              price: product.price,
              qty: product.qty,
              category: product.category,
              metadata: product.metadata,
            });
          }}
        >
          Agregar
        </button>
      )}

      {expanded && (
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid #eee',
            fontSize: '0.85rem',
            textAlign: 'left',
          }}
        >
          {images.length > 1 && (
            <div
              style={{
                display: 'flex',
                gap: '5px',
                marginBottom: '10px',
                overflowX: 'auto',
              }}
            >
              {images.map((img: string, idx: number) => (
                <img
                  key={idx}
                  src={img}
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />
              ))}
            </div>
          )}
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Detalles completos:
          </p>
          <p style={{ margin: '0.2rem 0' }}>
            <strong>Categoría:</strong> {product.category}
          </p>
          {product.metadata &&
            Object.entries(product.metadata).map(([key, value]) => {
              const lowerKey = key.toLowerCase();
              // Deny list: campos técnicos de manejo de imágenes, ofertas o vacíos
              if (
                lowerKey.includes('image') ||
                lowerKey.includes('offer') ||
                lowerKey.includes('discount') ||
                value === '' ||
                value === null ||
                value === undefined
              )
                return null;
              return (
                <p key={key} style={{ margin: '0.2rem 0' }}>
                  <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{' '}
                  {String(value)}
                </p>
              );
            })}
        </div>
      )}
    </div>
  );
}
