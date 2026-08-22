'use client';
import { useState } from 'react';
import { useCart } from '../lib/CartContext';

const CartIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

export const CartFloatingWidget = ({
  phoneNumber,
}: {
  phoneNumber: string;
}) => {
  const {
    items,
    isExpanded,
    setIsExpanded,
    updateQuantity,
    removeFromCart,
    paymentMethod,
    setPaymentMethod,
    shippingOption,
    setShippingOption,
  } = useCart();
  const [view, setView] = useState<'cart' | 'checkout'>('cart');

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const generateWhatsAppLink = () => {
    const phone = phoneNumber.replace(/[^0-9]/g, '');
    const ticket = items
      .map((i) => `* ${i.name} (x${i.qty}) - $${(i.price * i.qty).toFixed(2)}`)
      .join('%0a');
    const message = `*Nuevo Pedido*%0a%0a${ticket}%0a%0aTotal: $${total.toFixed(2)}%0aPago: ${paymentMethod || 'No especificado'}%0aEnvío: ${shippingOption === 'envio' ? 'Sí' : 'No'}`;
    return `https://wa.me/${phone}?text=${message}`;
  };

  if (items.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
      }}
    >
      {/* Botón flotante para abrir/cerrar */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CartIcon />
        </button>
      )}

      {/* Ventana expandida */}
      {isExpanded && (
        <div
          style={{
            width: '320px',
            backgroundColor: 'var(--color-surface)',
            borderRadius: '15px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
            padding: '1rem',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <strong style={{ fontSize: '1.2rem' }}>
              {view === 'cart' ? 'Tu Carrito' : 'Finalizar Pedido'}
            </strong>
            <button
              onClick={() => {
                setIsExpanded(false);
                setView('cart');
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {view === 'cart' ? (
              <>
                {items.map((item) => (
                  <div
                    key={item.code}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem 0',
                    }}
                  >
                    <span>
                      {item.name} x {item.qty}
                    </span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => updateQuantity(item.code, -1)}
                        style={{ width: '25px', borderRadius: '50%' }}
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateQuantity(item.code, 1)}
                        style={{ width: '25px', borderRadius: '50%' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setView('checkout')}
                  style={{
                    width: '100%',
                    marginTop: '1rem',
                    padding: '0.8rem',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                >
                  Ir a Finalizar ($ {total.toFixed(2)})
                </button>
              </>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <select
                  value={paymentMethod || ''}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  style={{ padding: '0.5rem' }}
                >
                  <option value="">Seleccionar Pago</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                </select>
                <select
                  value={shippingOption || ''}
                  onChange={(e) => setShippingOption(e.target.value as any)}
                  style={{ padding: '0.5rem' }}
                >
                  <option value="">Seleccionar Envío</option>
                  <option value="retiro">Retiro en local</option>
                  <option value="envio">Envío</option>
                </select>
                <a
                  href={generateWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textAlign: 'center',
                    padding: '0.8rem',
                    backgroundColor: '#25D366',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                  }}
                >
                  Enviar por WhatsApp
                </a>
                <button
                  onClick={() => setView('cart')}
                  style={{
                    background: 'none',
                    border: 'none',
                    textDecoration: 'underline',
                  }}
                >
                  Volver al carrito
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
