import React, { useState, useEffect, useCallback } from 'react';
import { executeCmd } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { PackagePlus, Search, Box, X, Save } from 'lucide-react';

interface Product {
  code: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

const StockView = () => {
  const { session } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ code: '', name: '', price: '', quantity: '', category: '' });

  const fetchStock = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching stock for tenant:', session.tenantId);
      const res = await executeCmd('products.list', {}, session.tenantId || '');
      console.log('products.list response:', JSON.stringify(res, null, 2));
      const productsData = res?.data?.results || [];
      console.log('Extracted products:', productsData);
      setProducts(productsData);
    } catch (err) { console.error('Stock error:', err); setProducts([]); }
    finally { setLoading(false); }
  }, [session.tenantId]);

  useEffect(() => {
    (async () => {
      await fetchStock();
    })();
  }, [fetchStock]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Saving product:', formData);
      const res = await executeCmd('stock.add', {
        code: formData.code,
        name: formData.name,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        category: formData.category,
        is_weight: false,
      }, session.tenantId || '');

      console.log('stock.add response:', JSON.stringify(res, null, 2));
      if (res && res.success) {
        setIsModalOpen(false);
        setFormData({ code: '', name: '', price: '', quantity: '', category: '' });
        await fetchStock();
      } else {
        console.error('stock.add failed:', res?.message);
        alert(res?.message || 'Error al guardar');
      }
    } catch (err) {
      console.error('stock.add catch error:', err);
      alert('Error al guardar');
    }
  };

  const filtered = (products || []).filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-mac-text">📦 Inventario</h1>
        <button data-testid="btn-add-product" onClick={() => setIsModalOpen(true)} className="bg-mac-accent text-white p-3 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-600 transition-all">
          <PackagePlus className="w-6 h-6" />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          data-testid="input-search-stock"
          type="text"
          placeholder="Buscar producto..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-mac-accent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mac-accent"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <div key={p.code} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-mac-accent transition-all" data-testid={`product-${p.code}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500"><Box className="w-6 h-6" /></div>
                <div><h3 className="font-semibold">{p.name}</h3><p className="text-xs text-slate-400">{p.code}</p></div>
              </div>
              <div className="text-right">
                <div className="font-bold">${p.price}</div>
                <div className={`text-xs ${p.quantity < 5 ? 'text-red-500' : 'text-slate-400'}`}>{p.quantity} disp.</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-400"><X className="w-6 h-6" /></button>
            <h2 className="text-xl font-bold mb-6">Agregar Producto</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input data-testid="modal-code" required placeholder="Código" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-mac-accent" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                <input data-testid="modal-cat" required placeholder="Categoría" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-mac-accent" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
              </div>
              <input data-testid="modal-name" required placeholder="Nombre" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-mac-accent" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <input data-testid="modal-price" type="number" step="0.01" required placeholder="Precio" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-mac-accent" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                <input data-testid="modal-qty" type="number" required placeholder="Cantidad" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-mac-accent" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
              </div>
              <button type="submit" className="w-full bg-mac-accent text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all mt-4 shadow-lg shadow-blue-200"><Save className="w-5 h-5" /> Guardar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockView;
