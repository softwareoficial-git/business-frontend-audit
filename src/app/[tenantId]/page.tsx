'use client';
import { useEffect, useState, useMemo } from 'react';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import Icon from '../../components/Icon';
import { CartProvider } from '../../lib/CartContext';

function PublicStoreContent({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { addToCart } = useCart();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProducts, setExpandedProducts] = useState<
    Record<string, boolean>
  >({});

  const toggleExpand = (productId: string) => {
    setExpandedProducts((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  useEffect(() => {
    params.then((p) => setTenantId(p.tenantId));
  }, [params]);

  useEffect(() => {
    if (!tenantId) return;

    const baseUrl =
      'https://business-logic-v2-production.up.railway.app/api/public/store';

    // Forzar el uso de slugs siempre, tratando al tenantId como un slug
    const detailsUrl = `${baseUrl}/name/${tenantId}/details`;
    const productsUrl = `${baseUrl}/name/${tenantId}/products`;

    Promise.all([
      fetch(detailsUrl).then((res) => res.json()),
      fetch(productsUrl).then((res) => res.json()),
    ])
      .then(([details, products]) => {
        console.log('Details:', details);
        console.log('Products:', products);

        setStoreData({
          ...products,
          settings: details.settings,
          store_info: details.store_info,
        });
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
        padding: '0',
        fontFamily: 'var(--font-family)',
        maxWidth: '1000px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          height: '250px',
          background: '#ddd',
          position: 'relative',
          marginBottom: '60px',
        }}
      >
        <ImageWithFallback
          src={storeData.settings?.assets?.banner_url || '/default-banner.png'}
          alt="Banner"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-40px',
            left: '2rem',
            zIndex: 1,
          }}
        >
          <ImageWithFallback
            src={storeData.settings?.assets?.logo_url || '/default-logo.png'}
            alt="Logo"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '6px solid var(--color-surface)',
              background: 'var(--color-surface)',
            }}
          />
        </div>
      </div>

      <div style={{ padding: '0 2rem 2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0' }}>
          {storeData.settings?.store_info?.name || storeData.tenantName}
        </h1>
        {storeData.settings?.store_info?.description && (
          <p
            style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}
          >
            {storeData.settings.store_info.description}
          </p>
        )}

        {/* Sección de Contacto */}
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            flexWrap: 'wrap',
            marginBottom: '2rem',
          }}
        >
          {storeData.settings?.store_info?.whatsapp && (
            <a
              href={`https://wa.me/${storeData.settings.store_info.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                color: '#25D366',
              }}
            >
              <Icon
                name="whatsapp"
                style={{ width: '20px', height: '20px', color: '#25D366' }}
              />
              {storeData.settings.store_info.whatsapp}
            </a>
          )}

          {storeData.settings?.store_info?.address && (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>📍</span> {storeData.settings.store_info.address}
            </div>
          )}
        </div>
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
            <div
              key={product.id}
              className="card masonry-item"
              style={{ cursor: 'pointer', position: 'relative' }}
              onClick={() => toggleExpand(product.id)}
            >
              <ImageWithFallback
                src={product.image_url}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  filter: product.qty <= 0 ? 'grayscale(1)' : 'none',
                }}
              />
              <div style={{ opacity: product.qty <= 0 ? 0.5 : 1 }}>
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

              {product.qty > 0 && (
                <button
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    marginTop: '0.5rem',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart({ code: product.id, name: product.name, price: product.price, qty: product.qty });
                  }}
                >
                  Agregar
                </button>
              )}

              {expandedProducts[product.id] && product.metadata && (
                <div
                  style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #eee',
                    fontSize: '0.85rem',
                  }}
                >
                  <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Detalles:
                  </p>
                  {Object.entries(product.metadata).map(([key, value]) => (
                    <p key={key} style={{ margin: '0.2rem 0' }}>
                      <strong>{key}:</strong> {String(value)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <CartFloatingWidget phoneNumber={storeData.settings?.store_info?.whatsapp || ''} />
    </main>
  );
}

export default function PublicStorePage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  return (
    <CartProvider>
      <PublicStoreContent params={params} />
    </CartProvider>
  );
}

