'use client';
import { useEffect, useState, useMemo } from 'react';
import { ImageWithFallback } from '../../components/ImageWithFallback';

export default function PublicStorePage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    params.then((p) => setTenantId(p.tenantId));
  }, [params]);

  useEffect(() => {
    if (!tenantId) return;

    const isId = /^\d+$/.test(tenantId);
    const url = isId
      ? `https://business-logic-v2-production.up.railway.app/api/public/store/${tenantId}/products`
      : `https://business-logic-v2-production.up.railway.app/api/public/store/name/${tenantId}/products`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Tienda no encontrada');
        return res.json();
      })
      .then((data) => {
        setStoreData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error cargando la tienda:', err);
        setLoading(false);
      });
  }, [tenantId]);

  // Lógica de búsqueda en cliente
  const filteredProducts = useMemo(() => {
    if (!storeData?.data) return [];
    return storeData.data.filter(
      (p: any) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [storeData, searchTerm]);

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
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '1000px',
        margin: '0 auto',
        paddingBottom: '3rem',
      }}
    >
      {/* Banner y Perfil */}
      <div
        style={{ height: '200px', background: '#ddd', position: 'relative' }}
      >
        <ImageWithFallback
          src={storeData.banner_url}
          alt="Banner"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', bottom: '-40px', left: '2rem' }}>
          <ImageWithFallback
            src={storeData.profile_url}
            alt="Logo"
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              border: '4px solid white',
              background: 'white',
            }}
          />
        </div>
      </div>

      <div style={{ padding: '4rem 2rem 2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0' }}>{storeData.tenantName}</h1>
        <p style={{ color: '#666' }}>
          Bienvenido a nuestra tienda. Mira nuestro stock disponible.
        </p>
      </div>

      {/* Buscador */}
      <div style={{ padding: '0 2rem 2rem' }}>
        <input
          type="text"
          placeholder="Buscar productos..."
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
          }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Productos */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '2rem',
          padding: '0 2rem',
        }}
      >
        {filteredProducts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              gridColumn: '1 / -1',
              padding: '2rem',
            }}
          >
            <p style={{ fontSize: '1.2rem', color: '#888' }}>
              ¡Aún no hay productos en esta tienda!
            </p>
            <p style={{ color: '#aaa' }}>
              Carga algunos desde tu panel administrativo para que aparezcan
              aquí.
            </p>
          </div>
        ) : (
          filteredProducts.map((product: any) => (
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
                  Stock: {product.qty}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
