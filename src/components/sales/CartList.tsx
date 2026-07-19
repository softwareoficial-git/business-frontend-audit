'use client';

interface CartItem {
  code: string;
  name: string;
  price: number;
  qty: number;
}

export default function CartList({ items }: { items: CartItem[] }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
      {items.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--color-secondary)' }}>Carrito vacío</p>
      ) : (
        items.map((item) => (
          <div key={item.code} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.5rem 0',
            borderBottom: '1px solid var(--color-border)'
          }}>
            <span>{item.name} (x{item.qty})</span>
            <span>${(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))
      )}
    </div>
  );
}
