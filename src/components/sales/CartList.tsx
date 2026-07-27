'use client';

interface CartItem {
  code: string;
  name: string;
  price: number;
  qty: number;
  stock?: number;
}

export default function CartList({
  items,
  onUpdateQty,
}: {
  items: CartItem[];
  onUpdateQty: (code: string, delta: number) => void;
}) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
      {items.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--color-secondary)' }}>
          Carrito vacío
        </p>
      ) : (
        items.map((item) => (
          <div
            key={item.code}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600 }}>{item.name}</span>
              <span
                style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}
              >
                ${item.price.toFixed(2)}
              </span>
            </div>

            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <button
                onClick={() => onUpdateQty(item.code, -1)}
                style={{ padding: '0.2rem 0.5rem' }}
              >
                -
              </button>
              <span>{item.qty}</span>
              <button
                onClick={() => onUpdateQty(item.code, 1)}
                style={{ padding: '0.2rem 0.5rem' }}
              >
                +
              </button>
            </div>

            <span style={{ fontWeight: 600 }}>
              ${(item.price * item.qty).toFixed(2)}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
