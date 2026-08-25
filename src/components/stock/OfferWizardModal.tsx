import React, { useState } from 'react';
import AddProductModal from './AddProductModal'; // Reutilizamos para crear nuevos
import { useLoading } from '../loading/LoadingProvider';
import { apiClient } from '../../lib/api';

export default function OfferWizardModal({
  onClose,
  products,
  onSave,
}: {
  onClose: () => void;
  products: any[];
  onSave: () => void;
}) {
  const [step, setStep] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const { startLoading, stopLoading } = useLoading();

  const [offerConfigs, setOfferConfigs] = useState<
    Record<string, { discountPercent: string }>
  >({});

  const toggleProduct = (product: any) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.code === product.code);
      if (exists) {
        const newConfigs = { ...offerConfigs };
        delete newConfigs[product.code];
        setOfferConfigs(newConfigs);
        return prev.filter((p) => p.code !== product.code);
      } else {
        setOfferConfigs((prev) => ({
          ...prev,
          [product.code]: { discountPercent: '10' },
        }));
        return [...prev, product];
      }
    });
  };

  const updateDiscount = (code: string, discount: string) => {
    setOfferConfigs((prev) => ({
      ...prev,
      [code]: { ...prev[code], discountPercent: discount },
    }));
  };

  const handleSaveAllOffers = async () => {
    startLoading();
    try {
      for (const product of selectedProducts) {
        const config = offerConfigs[product.code];
        const newMetadata = {
          ...(product.metadata || {}),
          is_offer: 'true',
          discount_percent: config.discountPercent,
        };

        await apiClient('/execute', {
          method: 'POST',
          body: JSON.stringify({
            cmd: 'stock.update',
            params: {
              code: product.code,
              ...product,
              metadata: newMetadata,
            },
          }),
        });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving offers', error);
    } finally {
      stopLoading();
    }
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
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          padding: '2rem',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        {step === 1 && (
          <div>
            <h2>Paso 1: Seleccionar Productos</h2>
            <button
              onClick={() => setIsNewProductModalOpen(true)}
              className="btn-secondary"
            >
              + Crear Producto Nuevo
            </button>
            <div style={{ marginTop: '1rem' }}>
              {products.map((p) => (
                <div
                  key={p.code}
                  onClick={() => toggleProduct(p)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    marginBottom: '0.5rem',
                    backgroundColor: selectedProducts.find(
                      (s) => s.code === p.code
                    )
                      ? 'var(--color-primary-light)'
                      : 'transparent',
                  }}
                >
                  {p.name}
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={selectedProducts.length === 0}
              className="btn-primary"
            >
              Siguiente
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2>Paso 2: Configurar Ofertas</h2>
            <div style={{ marginTop: '1rem' }}>
              {selectedProducts.map((p) => (
                <div
                  key={p.code}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #eee',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>{p.name}</span>
                  <input
                    type="number"
                    value={offerConfigs[p.code]?.discountPercent || ''}
                    onChange={(e) => updateDiscount(p.code, e.target.value)}
                    placeholder="% Desc"
                    style={{ width: '80px', padding: '0.3rem' }}
                  />
                </div>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="btn-secondary">
              Atrás
            </button>
            <button onClick={() => setStep(3)} className="btn-primary">
              Siguiente
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2>Paso 3: Previsualización</h2>
            <div style={{ marginTop: '1rem' }}>
              {selectedProducts.map((p) => (
                <div
                  key={p.code}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #eee',
                    marginBottom: '0.5rem',
                  }}
                >
                  <strong>{p.name}</strong> - Descuento:{' '}
                  {offerConfigs[p.code]?.discountPercent}%
                </div>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="btn-secondary">
              Atrás
            </button>
            <button onClick={handleSaveAllOffers} className="btn-primary">
              Finalizar y Guardar
            </button>
          </div>
        )}
      </div>

      {isNewProductModalOpen && (
        <AddProductModal
          onClose={() => setIsNewProductModalOpen(false)}
          onAdd={() => {}}
          products={products}
        />
      )}
    </div>
  );
}
