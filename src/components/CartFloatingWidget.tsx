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

const HandleIcon = ({ expanded }: { expanded: boolean }) => (
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
    {expanded ? (
      <polyline points="6 9 12 15 18 9"></polyline>
    ) : (
      <polyline points="6 15 12 9 18 15"></polyline>
    )}
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
    const message = `*Nuevo Pedido*%0a%0a${ticket}%0a%0aTotal: $${total.toFixed(
      2
    )}%0aPago: ${paymentMethod || 'No especificado'}%0aEnvío: ${
      shippingOption === 'envio' ? 'Sí' : 'No'
    }`;
    return `https://wa.me/${phone}?text=${message}`;
  };

  if (items.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        transition: 'transform 0.3s ease-out',
        transform: isExpanded
          ? 'translateY(0)'
          : 'translateY(calc(100% - 60px))',
        height: '80vh',
        borderTopLeftRadius: '15px',
        borderTopRightRadius: '15px',
        padding: '0 1rem',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Barra de control (ASA) */}
      <div
        style={{
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          flexShrink: 0,
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CartIcon />
          <strong>Carrito ({items.length})</strong>
        </div>
        <HandleIcon expanded={isExpanded} />
      </div>

      {/* Contenido expandido */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
        {view === 'cart' ? (
          <>
            {items.map((item) => (
              <div
                key={item.code}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <span>
                  {item.name} x {item.qty}
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => updateQuantity(item.code, -1)}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    -
                  </button>
                  <button
                    onClick={() => updateQuantity(item.code, 1)}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      border: '1px solid var(--color-border)',
                    }}
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
                padding: '1rem',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 'bold',
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
              marginTop: '1rem',
            }}
          >
            <select
              value={paymentMethod || ''}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)' }}
            >
              <option value="">Seleccionar Pago</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
            </select>
            <select
              value={shippingOption || ''}
              onChange={(e) => setShippingOption(e.target.value as any)}
              style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)' }}
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
                fontWeight: 'bold',
              }}
            >
              Enviar por WhatsApp
            </a>
            <button
              onClick={() => setView('cart')}
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                padding: '0.8rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              Volver al carrito
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
