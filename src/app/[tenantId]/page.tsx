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

  // Lógica de búsqueda mejorada
  const filteredProducts = useMemo(() => {
    if (!storeData?.data) return [];
    const term = searchTerm.toLowerCase();

    return storeData.data.filter((p: any) => {
      const inName = p.name?.toLowerCase().includes(term);
      const inCategory = p.category?.toLowerCase().includes(term);
      const metaValues = Object.values(p.metadata || {})
        .join(' ')
        .toLowerCase();
      const inMetadata = metaValues.includes(term);

      return inName || inCategory || inMetadata;
    });
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
        padding: '1rem',
        fontFamily: 'var(--font-family)',
        maxWidth: '1000px',
        margin: '0 auto',
      }}
    >
      // Banner y Perfil
      <div
        style={{
          height: '200px',
          background: '#ddd',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <ImageWithFallback
          src={storeData.settings?.assets?.banner_url}
          alt="Banner"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', bottom: '-40px', left: '2rem' }}>
          <ImageWithFallback
            src={storeData.settings?.assets?.logo_url}
            alt="Logo"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '4px solid var(--color-surface)',
              background: 'var(--color-surface)',
            }}
          />
        </div>
      </div>
      <div style={{ padding: '3rem 1rem 1rem' }}>
        <h1 style={{ margin: '0' }}>
          {storeData.settings?.store_info?.name || storeData.tenantName}
        </h1>
        {storeData.settings?.store_info?.description && (
          <p>{storeData.settings.store_info.description}</p>
        )}
      </div>
      {/* Buscador */}
      <div style={{ padding: '1rem' }}>
        <input
          type="text"
          placeholder="Buscar productos..."
          className="card"
          style={{
            width: '100%',
            padding: '0.8rem',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {/* Productos */}
      <div className="stock-grid">
        {filteredProducts.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '2rem',
              gridColumn: '1 / -1',
            }}
          >
            <p>¡Aún no hay productos en esta tienda!</p>
          </div>
        ) : (
          filteredProducts.map((product: any) => (
            <div key={product.id} className="card masonry-item">
              <ImageWithFallback
                src={product.image_url}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                }}
              />
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h3>
              <p style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                ${product.price}
              </p>
              <p
                style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}
              >
                Stock: {product.qty}
              </p>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
