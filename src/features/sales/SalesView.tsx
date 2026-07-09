import React, { useState, useEffect, useCallback } from 'react';
import { executeCmd } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Search, ShoppingCart, Plus, Minus, CheckCircle2 } from 'lucide-react';

interface Product { code: string; name: string; price: number; quantity: number; category: string; }
interface CartItem extends Product { cartQuantity: number; }

const SalesView = () => {
  const { session } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchStock = useCallback(async () => {
    try {
      const res = await executeCmd('products.list', {}, session.tenantId || '');
      const productsData = res?.data?.results || [];
      setProducts(productsData);
    } catch (e) { console.error('Sales stock error:', e); setProducts([]); }
  }, [session.tenantId]);

  useEffect(() => {
    (async () => {
      await fetchStock();
    })();
  }, [fetchStock]);

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.code === p.code);
      if (existing) return prev.map(i => i.code === p.code ? { ...i, cartQuantity: i.cartQuantity + 1 } : i);
      return [...prev, { ...p, cartQuantity: 1 }];
    });
  };

  const updateQty = (code: string, delta: number) => {
    setCart(prev => prev.map(i => i.code === code ? { ...i, cartQuantity: Math.max(0, i.cartQuantity + delta) } : i).filter(i => i.cartQuantity > 0));
  };

  const total = cart.reduce((sum, i) => sum + (i.price * i.cartQuantity), 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await executeCmd('sales.cobrar', {
        customer_phone: customerPhone,
        items: cart.map(i => i.code),
        paga_con: parseFloat(paymentAmount),
      }, session.tenantId || '');

      if (res && res.success) {
        alert('✅ Venta procesada');
        setCart([]); setCustomerPhone(''); setPaymentAmount('');
        await fetchStock();
      } else {
        alert(res?.message || 'Error en venta');
      }
    } catch (e) { alert('Error en venta'); }
    finally { setProcessing(false); }
  };

  const filtered = (products || []).filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-mac-text">💰 Punto de Venta</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input data-testid="input-search-sales" type="text" placeholder="Buscar producto..." className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-mac-accent" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map(p => (
            <button key={p.code} data-testid={`product-btn-${p.code}`} onClick={() => addToCart(p)} disabled={p.quantity <= 0} className={`p-4 rounded-2xl border transition-all text-left h-32 ${p.quantity <= 0 ? 'bg-slate-100 opacity-50' : 'bg-white hover:border-mac-accent'}`}>
              <h3 className="font-semibold truncate">{p.name}</h3>
              <p className="text-xs text-slate-400 truncate">{p.code}</p>
              <div className="mt-auto flex justify-between items-end">
                <span className="font-bold text-mac-accent">${p.price}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-600">{p.quantity} disp.</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col h-fit sticky top-4">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <ShoppingCart className="w-6 h-6 text-mac-accent" />
          <h2 className="text-xl font-bold">Carrito</h2>
        </div>
        <div className="p-6 space-y-4 max-h-[40vh] overflow-y-auto">
          {cart.length === 0 ? <p className="text-center py-8 text-slate-400">Vacío</p> :
            cart.map(i => (
              <div key={i.code} className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl">
                <div className="flex-1 min-w-0"><h4 className="text-sm font-semibold truncate">{i.name}</h4><p className="text-xs text-slate-500">${i.price} x {i.cartQuantity}</p></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(i.code, -1)} className="p-1 bg-white border rounded-md"><Minus className="w-3 h-3" /></button>
                  <span className="text-sm w-4 text-center">{i.cartQuantity}</span>
                  <button onClick={() => updateQty(i.code, 1)} className="p-1 bg-white border rounded-md"><Plus className="w-3 h-3" /></button>
                </div>
              </div>
            ))
          }
        </div>
        <div className="p-6 bg-slate-50 rounded-b-3xl border-t border-slate-100 space-y-4">
          <div className="flex justify-between items-center text-lg font-bold"><span>Total</span><span className="text-mac-accent">${total.toFixed(2)}</span></div>
          <form onSubmit={handleCheckout} className="space-y-3">
            <input data-testid="input-phone" type="text" placeholder="Teléfono Cliente" className="w-full p-2 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-mac-accent text-sm" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
            <input data-testid="input-payment" type="number" step="0.01" placeholder="Monto Recibido" className="w-full p-2 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-mac-accent text-sm" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} required />
            <button data-testid="btn-confirm-sale" type="submit" disabled={processing || cart.length === 0} className="w-full bg-mac-accent text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"><CheckCircle2 className="w-5 h-5" /> Confirmar</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SalesView;
