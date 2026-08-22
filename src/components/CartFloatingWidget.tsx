'use client';
import { useState } from 'react';
import { useCart } from '../lib/CartContext';
import { CheckoutModal } from './CheckoutModal';

export const CartFloatingWidget = ({ phoneNumber }: { phoneNumber: string }) => {
  const { items, isExpanded, setIsExpanded, updateQuantity, removeFromCart } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (items.length === 0) return null;

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        padding: isExpanded ? '1rem' : '0.5rem 1rem',
        zIndex: 1000,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setIsExpanded(!isExpanded)}>
          <strong>Carrito ({items.length} productos)</strong>
          <span>${total.toFixed(2)}</span>
        </div>
        
        {isExpanded && (
          <div style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
            {items.map(item => (
              <div key={item.code} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <span>{item.name} x {item.qty}</span>
                <div>
                  <button onClick={() => updateQuantity(item.code, -1)}>-</button>
                  <button onClick={() => updateQuantity(item.code, 1)}>+</button>
                  <button onClick={() => removeFromCart(item.code)}>x</button>
                </div>
              </div>
            ))}
            <button 
              onClick={() => setIsCheckoutOpen(true)}
              style={{ width: '100%', marginTop: '1rem', padding: '0.8rem', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)' }}
            >
              Finalizar Compra
            </button>
          </div>
        )}
      </div>
      {isCheckoutOpen && <CheckoutModal onClose={() => setIsCheckoutOpen(false)} phoneNumber={phoneNumber} />}
    </>
  );
};
