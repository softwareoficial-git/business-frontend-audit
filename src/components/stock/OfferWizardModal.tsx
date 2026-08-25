import React, { useState } from 'react';
import AddProductModal from './AddProductModal'; // Reutilizamos para crear nuevos

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

  const toggleProduct = (product: any) => {
    setSelectedProducts((prev) =>
      prev.find((p) => p.code === product.code)
        ? prev.filter((p) => p.code !== product.code)
        : [...prev, product]
    );
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
            {/* Aquí vendrá el editor en tiempo real */}
            <p>Configurando {selectedProducts.length} productos...</p>
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
            {/* Aquí vendrá el simulador de tarjeta final */}
            <button onClick={() => setStep(2)} className="btn-secondary">
              Atrás
            </button>
            <button onClick={onSave} className="btn-primary">
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
