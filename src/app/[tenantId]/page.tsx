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
  const [activeFilters, setActiveFilters] = useState<
    {
      key: 'category' | 'metadata';
      value: string;
    }[]
  >([]);
  const [viewMode, setViewMode] = useState<'large' | 'compact'>('large');
  const [expandedProducts, setExpandedProducts] = useState<
    Record<string, boolean>
  >({});

  const [products, setProducts] = useState<any[]>([]);

  const toggleFilter = (filter: {
    key: 'category' | 'metadata';
    value: string;
  }) => {
    setActiveFilters((prev) => {
      const exists = prev.find(
        (f) => f.key === filter.key && f.value === filter.value
      );
      if (exists)
        return prev.filter(
          (f) => !(f.key === filter.key && f.value === filter.value)
        );
      return [...prev, filter];
    });
  };
  // Extraer categorías y etiquetas de metadata únicas (necesario para la UI)
  const availableFilters = useMemo(() => {
    if (!products)
      return {
        categories: [],
        metadataTags: {} as Record<string, Set<string>>,
      };

    // 1. Filtrar productos por categorías seleccionadas previamente
    const activeCategories = activeFilters
      .filter((f) => f.key === 'category')
      .map((f) => f.value);
    const filteredByCat =
      activeCategories.length > 0
        ? products.filter((p) => activeCategories.includes(p.category))
        : products;

    const categories = new Set<string>();
    const metadataTags: Record<string, Set<string>> = {};

    products.forEach((p: any) => {
      // Categorías principales siempre disponibles
      if (
        p.category &&
        !activeFilters.some(
          (f) => f.key === 'category' && f.value === p.category
        )
      ) {
        categories.add(p.category);
      }
    });

    // Metadata solo de los productos filtrados por las categorías activas
    filteredByCat.forEach((p: any) => {
      if (p.metadata) {
        Object.entries(p.metadata).forEach(([key, value]) => {
          // Separar valores complejos por coma
          const rawValues = String(value)
            .split(',')
            .map((v) => v.trim());

          if (!metadataTags[key]) metadataTags[key] = new Set();

          rawValues.forEach((v) => {
            if (
              v &&
              !activeFilters.some(
                (f) => f.key === 'metadata' && f.value === `${key}:${v}`
              )
            ) {
              metadataTags[key].add(v);
            }
          });
        });
      }
    });

    return {
      categories: Array.from(categories),
      metadataTags: Object.fromEntries(
        Object.entries(metadataTags).map(([k, v]) => [k, Array.from(v)])
      ),
    };
  }, [products, activeFilters]);

  const toggleExpand = (productId: string) => {
    setExpandedProducts((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  useEffect(() => {
    params.then((p) => setTenantId(p.tenantId));
  }, [params]);

  useEffect(() => {
    if (!tenantId) return;

    setLoading(true);
    const baseUrl =
      'https://business-logic-v2-production.up.railway.app/api/public/store';

    let productsUrl = `${baseUrl}/name/${tenantId}/products`;
    const queryParams = new URLSearchParams();

    // Agrupar filtros para enviarlos como arrays a la API
    const groupedFilters: Record<string, string[]> = {};
    activeFilters.forEach((f) => {
      const paramKey =
        f.key === 'category' ? 'category' : `metadata.${f.value.split(':')[0]}`;
      const paramVal = f.key === 'category' ? f.value : f.value.split(':')[1];
      if (!groupedFilters[paramKey]) groupedFilters[paramKey] = [];
      groupedFilters[paramKey].push(paramVal);
    });

    Object.entries(groupedFilters).forEach(([key, values]) => {
      values.forEach((v) => queryParams.append(key, v));
    });

    if (queryParams.toString()) {
      productsUrl += `?${queryParams.toString()}`;
    }

    const detailsUrl = `${baseUrl}/name/${tenantId}/details`;

    Promise.all([
      fetch(detailsUrl).then((res) => res.json()),
      fetch(productsUrl).then((res) => res.json()),
    ])
      .then(([details, productsResponse]) => {
        setProducts(productsResponse.data || []);
        if (!storeData) {
          setStoreData({
            success: true,
            settings: details.settings,
            store_info: details.store_info,
            tenantName: details.tenantName || productsResponse.tenantName,
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error cargando la tienda:', err);
        setLoading(false);
      });
  }, [tenantId, activeFilters]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const term = searchTerm.toLowerCase();
    if (!term) return products;

    return products.filter((p: any) => {
      const inName = p.name?.toLowerCase().includes(term);
      const inCategory = p.category?.toLowerCase().includes(term);
      const metaValues = Object.values(p.metadata || {})
        .join(' ')
        .toLowerCase();
      const inMetadata = metaValues.includes(term);
      return inName || inCategory || inMetadata;
    });
  }, [products, searchTerm]);

  if (loading && !products.length)
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
      </div>

      <div
        style={{
          padding: '1rem',
          display: 'flex',
          gap: '10px',
          flexDirection: 'column',
        }}
      >
        <input
          type="text"
          placeholder="Buscar productos o etiquetas..."
          className="card"
          style={{ padding: '0.8rem', borderRadius: 'var(--radius-md)' }}
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
        />

        {/* Sugerencias horizontales */}
        {searchTerm.length >= 2 && (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
            }}
          >
            {availableFilters.categories
              .filter((c) => c.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    toggleFilter({ key: 'category', value: c });
                    setSearchTerm('');
                  }}
                  style={{
                    padding: '0.3rem 0.6rem',
                    borderRadius: '15px',
                    background: 'var(--color-secondary)',
                    color: 'white',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.split('/').pop()}
                </button>
              ))}
            {Object.entries(availableFilters.metadataTags).flatMap(
              ([k, vals]) =>
                vals
                  .filter((v) =>
                    v.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((v) => (
                    <button
                      key={`${k}:${v}`}
                      onClick={() => {
                        toggleFilter({ key: 'metadata', value: `${k}:${v}` });
                        setSearchTerm('');
                      }}
                      style={{
                        padding: '0.3rem 0.6rem',
                        borderRadius: '15px',
                        background: 'var(--color-secondary)',
                        color: 'white',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {v}
                    </button>
                  ))
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {activeFilters.map((f) => (
            <button
              key={`${f.key}:${f.value}`}
              onClick={() => toggleFilter(f)}
              style={{
                padding: '0.3rem 0.6rem',
                borderRadius: '10px',
                background: 'var(--color-primary)',
                color: 'white',
              }}
            >
              {f.value.split(':').pop()} ✕
            </button>
          ))}
          {/* ... [Botones de categorías] */}
          {availableFilters.categories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleFilter({ key: 'category', value: cat })}
              style={{
                padding: '0.3rem 0.6rem',
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
              }}
            >
              {cat.split('/').pop()}
            </button>
          ))}
          {Object.entries(availableFilters.metadataTags).map(([k, values]) =>
            values.map((v) => (
              <button
                key={`${k}:${v}`}
                onClick={() =>
                  toggleFilter({ key: 'metadata', value: `${k}:${v}` })
                }
                style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                }}
              >
                {v}
              </button>
            ))
          )}
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255,255,255,0.5)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Cargando...
          </div>
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            padding: '0 20px',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {filteredProducts.map((product: any) => (
            <div
              key={product.id}
              className="card"
              style={{ padding: '1rem', cursor: 'pointer' }}
              onClick={() => toggleExpand(product.id)}
            >
              <ImageWithFallback
                src={product.image_url}
                alt={product.name}
                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
              />
              <h3>{product.name}</h3>
              <p>${product.price}</p>
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
                  Agregar
                </button>
              )}
            </div>
          ))}
        </div>
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
