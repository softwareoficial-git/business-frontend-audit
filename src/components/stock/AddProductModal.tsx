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

  const [compatEnabled, setCompatEnabled] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [allModels, setAllModels] = useState<string[]>([]);
  const [modelInput, setModelInput] = useState('');
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);

  // Configuración de conexiones dinámicas (adaptabilidad global multirrubro)
  const [connectionFieldName, setConnectionFieldName] =
    useState('Compatibilidad');
  const [connectionKeys, setConnectionKeys] = useState<string[]>([
    'Marca',
    'Modelo',
  ]);

  useEffect(() => {
    fetchAvailableProducts();
    fetchAllModels();
    fetchSettings();
    if (productToEdit?.code) {
      fetchProductCompatibilities();
    }
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({ cmd: 'settings.get', params: {} }),
      });
      const result = await response.json();
      if (result.success && result.data) {
        if (result.data.connection_field_name) {
          setConnectionFieldName(result.data.connection_field_name);
        }
        if (result.data.connection_keys) {
          setConnectionKeys(result.data.connection_keys);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchAllModels = async () => {
    try {
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({ cmd: 'compat.list_models', params: {} }),
      });
      const result = await response.json();
      if (result.success) setAllModels(result.data || []);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const fetchProductCompatibilities = async () => {
    try {
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({
          cmd: 'compat.get_by_product',
          params: { productCode: productToEdit.code },
        }),
      });
      const result = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        setCompatEnabled(true);
        setSelectedModels(result.data);
      }
    } catch (error) {
      console.error('Error fetching product compatibilities:', error);
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

  // Calcular todas las claves conocidas globalmente + Compatibilidad forzada dinámica + Claves de conexión
  const allKnownKeys = Array.from(
    new Set([
      ...products.flatMap((p) => (p.metadata ? Object.keys(p.metadata) : [])),
      connectionFieldName,
      ...connectionKeys,
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

    // Detección automática de compatibilidad
    const categoryProducts = products.filter(
      (p) => p.category?.toLowerCase() === product.category?.toLowerCase()
    );
    const hasCompat = categoryProducts.some(
      (p) =>
        p.metadata &&
        Object.keys(p.metadata).some(
          (k) => k.toLowerCase() === connectionFieldName.toLowerCase()
        )
    );
    setCompatEnabled(hasCompat);

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
  }, [product.category]);

  const [metadata, setMetadata] = useState<{ key: string; value: string }[]>(
    productToEdit?.metadata
      ? Object.entries(productToEdit.metadata).map(([key, value]) => ({
          key,
          value: String(value),
        }))
      : []
  );

  // Nueva UI para campos especiales nativos
  const renderSpecialFields = () => {
    if (!compatEnabled) return null;

    return (
      <div
        style={{
          marginTop: '0.5rem',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-primary)',
          backgroundColor: 'rgba(37, 99, 235, 0.05)',
        }}
      >
        <label
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--color-primary)',
            marginBottom: '0.5rem',
            display: 'block',
          }}
        >
          Funciones Especiales: {connectionFieldName}
        </label>

        {/* Chips de modelos seleccionados */}
        {selectedModels.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.4rem',
              padding: '0.25rem',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-background)',
            }}
          >
            {selectedModels.map((m) => (
              <span
                key={m}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  backgroundColor: 'rgba(37, 99, 235, 0.15)',
                  color: '#2563eb',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                {m}
                <button
                  type="button"
                  onClick={() => handleRemoveModel(m)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Input predictivo */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              placeholder="Escribe un modelo (ej: Samsung A13)"
              value={modelInput}
              onChange={(e) => {
                setModelInput(e.target.value);
                setShowModelSuggestions(true);
              }}
              onFocus={() => setShowModelSuggestions(true)}
              onBlur={() =>
                setTimeout(() => setShowModelSuggestions(false), 200)
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddModel(modelInput);
                }
              }}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => handleAddModel(modelInput)}
              className="btn-primary"
              style={{ padding: '0.5rem var(--space-sm)' }}
            >
              +
            </button>
          </div>

          {/* Sugerencias flotantes */}
          {showModelSuggestions &&
            modelInput &&
            allModels.filter(
              (m) =>
                m.toLowerCase().includes(modelInput.toLowerCase()) &&
                !selectedModels.includes(m)
            ).length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  zIndex: 100,
                  maxHeight: '150px',
                  overflowY: 'auto',
                  boxShadow: 'var(--shadow-card)',
                  padding: '0.25rem',
                  boxSizing: 'border-box',
                  marginTop: '2px',
                }}
              >
                {allModels
                  .filter(
                    (m) =>
                      m.toLowerCase().includes(modelInput.toLowerCase()) &&
                      !selectedModels.includes(m)
                  )
                  .map((m) => (
                    <div
                      key={m}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleAddModel(m);
                      }}
                      style={{
                        padding: '0.5rem',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        color: 'var(--color-text)',
                        backgroundColor: 'var(--color-background)',
                        marginBottom: '2px',
                      }}
                    >
                      {m}
                    </div>
                  ))}
              </div>
            )}
        </div>
      </div>
    );
  };

  // UI para renderizar solo metadatos genéricos (excluye función especial)
  const renderMetadataFields = () => {
    return metadata
      .filter((m) => m.key.toLowerCase() !== connectionFieldName.toLowerCase())
      .map((m, i) => {
        const suggestionData = learnedAttributes.find(
          (attr) => attr.key.toLowerCase() === m.key.toLowerCase()
        );
        const valueSuggestions = suggestionData
          ? suggestionData.suggestions
          : [];
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

    // Si la clave cambia al nombre configurado, activar módulo especial y limpiar el campo
    if (
      field === 'key' &&
      value.toLowerCase() === connectionFieldName.toLowerCase()
    ) {
      setCompatEnabled(true);
      // Eliminar este índice de metadata para que no se renderice doble
      newMetadata.splice(index, 1);
    } else {
      newMetadata[index][field] = value;
    }

    setMetadata(newMetadata);
  };

  const handleAddModel = (modelName: string) => {
    const trimmed = modelName.trim();
    if (trimmed && !selectedModels.includes(trimmed)) {
      setSelectedModels([...selectedModels, trimmed]);
      if (!allModels.includes(trimmed)) {
        setAllModels([...allModels, trimmed]);
      }
    }
    setModelInput('');
    setShowModelSuggestions(false);
  };

  const handleRemoveModel = (modelName: string) => {
    setSelectedModels(selectedModels.filter((m) => m !== modelName));
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

    // Guardar el producto primero
    await onAdd(productPayload);

    // Sincronizar compatibilidades
    try {
      if (compatEnabled) {
        const res = await apiClient('/execute', {
          method: 'POST',
          body: JSON.stringify({
            cmd: 'compat.get_by_product',
            params: { productCode: product.code },
          }),
        });
        const result = await res.json();
        const existingModels: string[] = result.success
          ? result.data || []
          : [];

        const toLink = selectedModels.filter(
          (m) => !existingModels.includes(m)
        );
        const toUnlink = existingModels.filter(
          (m) => !selectedModels.includes(m)
        );

        for (const model of toLink) {
          await apiClient('/execute', {
            method: 'POST',
            body: JSON.stringify({
              cmd: 'compat.link',
              params: { productCode: product.code, modelName: model },
            }),
          });
        }

        for (const model of toUnlink) {
          await apiClient('/execute', {
            method: 'POST',
            body: JSON.stringify({
              cmd: 'compat.unlink',
              params: { productCode: product.code, modelName: model },
            }),
          });
        }
      } else {
        // Si se deshabilita, quitar todos los enlaces de compatibilidad previos
        const res = await apiClient('/execute', {
          method: 'POST',
          body: JSON.stringify({
            cmd: 'compat.get_by_product',
            params: { productCode: product.code },
          }),
        });
        const result = await res.json();
        if (result.success && result.data && result.data.length > 0) {
          for (const model of result.data) {
            await apiClient('/execute', {
              method: 'POST',
              body: JSON.stringify({
                cmd: 'compat.unlink',
                params: { productCode: product.code, modelName: model },
              }),
            });
          }
        }
      }
    } catch (error) {
      console.error('Error al sincronizar compatibilidades:', error);
    }

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

        {renderSpecialFields()}

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
