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
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    // Keep to avoid errors, but it won't be used for compat logic anymore
    try {
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({ cmd: 'settings.get', params: {} }),
      });
      // result ignored
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

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

  const [learnedAttributes, setLearnedAttributes] = useState<
    { key: string; suggestions: string[] }[]
  >([]);
  const [activeSuggestField, setActiveSuggestField] = useState<{
    index: number;
    type: 'key' | 'value';
  } | null>(null);

  // Calcular todas las claves conocidas globalmente
  const allKnownKeys = Array.from(
    new Set([
      ...products.flatMap((p) => (p.metadata ? Object.keys(p.metadata) : [])),
    ])
  );

  const getLearnedAttributes = (categoryName: string) => {
    if (!categoryName) return [];
    const catProducts = products.filter(
      (p) => p.category?.toLowerCase() === categoryName.toLowerCase()
    );

    const keyStats: Record<string, Set<string>> = {};

    catProducts.forEach((p) => {
      if (p.metadata && typeof p.metadata === 'object') {
        Object.entries(p.metadata).forEach(([key, val]) => {
          if (!keyStats[key]) {
            keyStats[key] = new Set();
          }
          if (val) {
            keyStats[key].add(String(val));
          }
        });
      }
    });

    return Object.entries(keyStats).map(([key, valueSet]) => ({
      key,
      suggestions: Array.from(valueSet),
    }));
  };

  useEffect(() => {
    if (!product.category) return;

    const attrs = getLearnedAttributes(product.category);
    setLearnedAttributes(attrs);

    // ANCHOR METADATA: Fusionar valores actuales con la plantilla de la categoría
    setMetadata((prev) => {
      const newMetadata = [...prev];

      // Asegurar que existan todos los campos de la "plantilla" de la categoría
      attrs.forEach((attr) => {
        const exists = newMetadata.find(
          (m) => m.key.toLowerCase() === attr.key.toLowerCase()
        );
        if (!exists) {
          // Añadimos el campo de la plantilla si no está presente
          newMetadata.push({ key: attr.key, value: '' });
        }
      });
      return newMetadata;
    });
  }, [product.category, products]);

  const [metadata, setMetadata] = useState<{ key: string; value: string }[]>(
    productToEdit?.metadata
      ? Object.entries(productToEdit.metadata).map(([key, value]) => ({
          key,
          value: Array.isArray(value) ? JSON.stringify(value) : String(value),
        }))
      : []
  );

  // Renderizado de metadatos genéricos
  const renderMetadataFields = () => {
    return metadata.map((m, i) => {
      const suggestionData = learnedAttributes.find(
        (attr) => attr.key.toLowerCase() === m.key.toLowerCase()
      );
      const valueSuggestions = suggestionData ? suggestionData.suggestions : [];
      const keySuggestions = allKnownKeys.filter((k) =>
        k.toLowerCase().includes(m.key.toLowerCase())
      );

      return (
        <div
          key={i}
          style={{
            position: 'relative',
            display: 'flex',
            gap: '0.5rem',
            width: '100%',
            marginTop: '0.5rem',
          }}
        >
          <input
            placeholder="Campo"
            value={m.key}
            onChange={(e) => {
              handleMetadataChange(i, 'key', e.target.value);
              setActiveSuggestField({ index: i, type: 'key' });
            }}
            onFocus={() => setActiveSuggestField({ index: i, type: 'key' })}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
            }}
          />
          <input
            placeholder="Valor"
            value={m.value}
            onChange={(e) => {
              handleMetadataChange(i, 'value', e.target.value);
              setActiveSuggestField({ index: i, type: 'value' });
            }}
            onFocus={() => setActiveSuggestField({ index: i, type: 'value' })}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
            }}
          />

          {/* Sugerencias de clave */}
          {activeSuggestField?.index === i &&
            activeSuggestField.type === 'key' &&
            keySuggestions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: '50%',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  zIndex: 100,
                  maxHeight: '100px',
                  overflowY: 'auto',
                }}
              >
                {keySuggestions.map((s) => (
                  <div
                    key={s}
                    onClick={() => {
                      handleMetadataChange(i, 'key', s);
                      setActiveSuggestField(null);
                    }}
                    style={{ padding: '0.5rem', cursor: 'pointer' }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}

          {/* Sugerencias de valor */}
          {activeSuggestField?.index === i &&
            activeSuggestField.type === 'value' &&
            valueSuggestions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  right: 0,
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  zIndex: 100,
                  maxHeight: '100px',
                  overflowY: 'auto',
                }}
              >
                {valueSuggestions.map((s) => (
                  <div
                    key={s}
                    onClick={() => {
                      handleMetadataChange(i, 'value', s);
                      setActiveSuggestField(null);
                    }}
                    style={{ padding: '0.5rem', cursor: 'pointer' }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
        </div>
      );
    });
  };

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

    // Guardar el producto
    await onAdd(productPayload);
    stopLoading();
    onClose();
  };

  return (
    <div
      onClick={onClose}
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
        padding: '1rem',
        boxSizing: 'border-box',
      }}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--color-surface)',
          padding: 'var(--space-md)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-sm)',
          width: '100%',
          maxWidth: '500px',
          margin: '0',
          position: 'relative',
          boxShadow:
            '0 0 20px 5px rgba(var(--color-primary-rgb, 37, 99, 235), 0.3)',
          border: '1px solid var(--color-border)',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '1rem',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {productToEdit ? 'Editar Producto' : 'Añadir Producto'}
        </div>

        {/* Espaciado superior para compensar el título absoluto */}
        <div style={{ marginTop: '1rem' }}></div>

        {/* Código con generador */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            placeholder="Código"
            value={product.code}
            onChange={(e) => setProduct({ ...product, code: e.target.value })}
            disabled={!!productToEdit}
            required
            style={{
              flex: '1 1 200px',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              boxSizing: 'border-box',
            }}
          />
          {!productToEdit && (
            <button
              type="button"
              onClick={() => {
                setProduct({
                  ...product,
                  code: Math.random()
                    .toString(36)
                    .substring(2, 10)
                    .toUpperCase(),
                });
              }}
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
          onChange={(e) => {
            setProduct({ ...product, name: e.target.value });
          }}
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
            flexWrap: 'wrap',
            boxSizing: 'border-box',
          }}
        >
          <input
            type="number"
            placeholder="Precio"
            value={product.price}
            onChange={(e) => {
              setProduct({ ...product, price: e.target.value });
            }}
            required
            style={{
              flex: '1 1 120px',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              boxSizing: 'border-box',
            }}
          />
          <input
            type="number"
            placeholder="Cantidad"
            value={product.qty}
            onChange={(e) => {
              setProduct({ ...product, qty: e.target.value });
            }}
            required
            style={{
              flex: '1 1 120px',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              boxSizing: 'border-box',
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

        {renderMetadataFields()}
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
