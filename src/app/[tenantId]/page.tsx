'use client';
import { useEffect, useState, useMemo } from 'react';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import Icon from '../../components/Icon';
import { CartProvider, useCart } from '../../lib/CartContext';
import { CartFloatingWidget } from '../../components/CartFloatingWidget';

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
  const [activeFilter, setActiveFilter] = useState<{
    key: 'category' | 'metadata';
    value: string;
  } | null>(null);
  const [viewMode, setViewMode] = useState<'large' | 'compact'>('large');
  const [expandedProducts, setExpandedProducts] = useState<
    Record<string, boolean>
  >({});

  // Extraer categorías y etiquetas de metadata únicas
  const availableFilters = useMemo(() => {
    if (!storeData?.data) return { categories: [], metadataTags: {} as Record<string, Set<string>> };
    
    const categories = new Set<string>();
    const metadataTags: Record<string, Set<string>> = {};

    storeData.data.forEach((p: any) => {
      if (p.category) categories.add(p.category);
      if (p.metadata) {
        Object.entries(p.metadata).forEach(([key, value]) => {
          if (!metadataTags[key]) metadataTags[key] = new Set();
          metadataTags[key].add(String(value));
        });
      }
    });

    return {
      categories: Array.from(categories),
      metadataTags: Object.fromEntries(
        Object.entries(metadataTags).map(([k, v]) => [k, Array.from(v)])
      ),
    };
  }, [storeData]);

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

  // Lógica de búsqueda y filtrado mejorada
  const filteredProducts = useMemo(() => {
    if (!storeData?.data) return [];
    
    return storeData.data.filter((p: any) => {
      // 1. Filtrado por término de búsqueda (búsqueda general)
      const term = searchTerm.toLowerCase();
      let matchesSearch = true;
      if (term) {
        const inName = p.name?.toLowerCase().includes(term);
        const inCategory = p.category?.toLowerCase().includes(term);
        const metaValues = Object.values(p.metadata || {})
          .join(' ')
          .toLowerCase();
        const inMetadata = metaValues.includes(term);
        matchesSearch = inName || inCategory || inMetadata;
      }

      // 2. Filtrado por categoría o etiqueta de metadata activa
      let matchesFilter = true;
      if (activeFilter) {
        if (activeFilter.key === 'category') {
          matchesFilter = p.category === activeFilter.value;
        } else if (activeFilter.key === 'metadata') {
          // El activeFilter.value debería contener la estructura "key:value"
          const [metaKey, metaValue] = activeFilter.value.split(':');
          matchesFilter = p.metadata?.[metaKey] === metaValue;
        }
      }

      return matchesSearch && matchesFilter;
    });
  }, [storeData, searchTerm, activeFilter]);

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
      {/* Buscador y Selector de Vista */}
      <div style={{ padding: '1rem', display: 'flex', gap: '10px', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Buscar productos..."
            className="card"
            style={{
              flex: 1,
              padding: '0.8rem',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
            }}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setActiveFilter(null); // Reset filtro si busca
            }}
          />
          <button
            onClick={() =>
              setViewMode((prev) => (prev === 'large' ? 'compact' : 'large'))
            }
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-background)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
            }}
          >
            {viewMode === 'large' ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" />
              </svg>
            )}
          </button>
        </div>

        {/* Botones de Filtros */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {activeFilter && (
            <button
              onClick={() => setActiveFilter(null)}
              style={{
                padding: '0.3rem 0.6rem',
                borderRadius: '10px',
                border: '1px solid var(--color-primary)',
                background: 'var(--color-primary)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              {activeFilter.value.split(':').pop()} ✕
            </button>
          )}
          {availableFilters.categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter({ key: 'category', value: cat })}
              style={{
                padding: '0.3rem 0.6rem',
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
                background: activeFilter?.value === cat ? 'var(--color-primary-light)' : 'var(--color-background)',
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              {cat}
            </button>
          ))}
          {Object.entries(availableFilters.metadataTags).map(([k, values]) => 
            values.map((v) => (
              <button
                key={`${k}:${v}`}
                onClick={() => setActiveFilter({ key: 'metadata', value: `${k}:${v}` })}
                style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                  background: activeFilter?.value === `${k}:${v}` ? 'var(--color-primary-light)' : 'var(--color-background)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                {k}: {v}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Productos */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            viewMode === 'large'
              ? 'repeat(auto-fit, minmax(200px, 1fr))'
              : 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '24px',
          padding: '0 20px',
          maxWidth: '1200px',
          margin: '0 auto',
          marginBottom: '80px',
        }}
      >
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
              className="card"
              style={{
                cursor: 'pointer',
                position: 'relative',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                boxSizing: 'border-box',
              }}
              onClick={() => toggleExpand(product.id)}
            >
              <ImageWithFallback
                src={product.image_url}
                alt={product.name}
                style={{
                  width: '100%',
                  height: viewMode === 'large' ? '150px' : '90px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '0.5rem',
                  filter: product.qty <= 0 ? 'grayscale(1)' : 'none',
                }}
              />
              <div style={{ opacity: product.qty <= 0 ? 0.5 : 1 }}>
                <h3
                  style={{
                    margin: '0 0 0.2rem 0',
                    fontSize: viewMode === 'large' ? '1rem' : '0.85rem',
                  }}
                >
                  {product.name}
                </h3>
                <p
                  style={{
                    fontWeight: 'bold',
                    color: 'var(--color-primary)',
                    margin: 0,
                    fontSize: '0.85rem',
                  }}
                >
                  ${product.price}
                </p>
              </div>

              {product.qty > 0 && (
                <button
                  style={{
                    width: '100%',
                    padding: '0.3rem',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    marginTop: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart({
                      code: product.id,
                      name: product.name,
                      price: product.price,
                      qty: product.qty,
                    });
                  }}
                >
                  {viewMode === 'large' ? 'Agregar' : '+'}
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
      <CartFloatingWidget
        phoneNumber={storeData.settings?.store_info?.whatsapp || ''}
      />
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
