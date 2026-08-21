'use client';
import { useEffect, useState } from 'react';
import { ImageWithFallback } from '../../components/ImageWithFallback';

export default function PublicStorePage({
  params,
}: {
  params: { tenantId: string };
}) {
  const { tenantId } = params;
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `https://business-logic-v2-production.up.railway.app/api/public/store/${tenantId}/products`
    )
      .then((res) => res.json())
      .then((data) => {
        setStoreData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error cargando la tienda:', err);
        setLoading(false);
      });
  }, [tenantId]);

  if (loading)
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Cargando tienda...
      </div>
    );
  if (!storeData || !storeData.success)
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Tienda no encontrada.
      </div>
    );

  return (
    <main
      style={{
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '1000px',
        margin: '0 auto',
      }}
    >
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#333' }}>
          {storeData.tenantName}
        </h1>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '2rem',
        }}
      >
        {storeData.data.map((product: any) => (
          <div
            key={product.id}
            style={{
              border: '1px solid #eee',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            <ImageWithFallback
              src={product.image_url}
              alt={product.name}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
            <div style={{ padding: '1rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h3>
              <p
                style={{
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  color: '#2ecc71',
                }}
              >
                ${product.price}
              </p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                Stock disponible: {product.qty}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
