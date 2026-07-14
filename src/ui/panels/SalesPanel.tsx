import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { useSalesLogic } from '../../bridge/hooks/useSalesLogic';
import { PanelContainer } from '../../engine/panels/PanelContainer';
import { useTranslate } from '../../engine/i18n/i18nStore';

const SalesPanel = () => {
  const t = useTranslate();
  const { products, cart, processing, fetchStock, addToCart, updateQty, checkout } = useSalesLogic();
  const [searchQuery, setSearchQuery] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const total = cart.reduce((sum, i) => sum + (i.price * i.cartQuantity), 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await checkout(customerPhone);
    if (res?.success) {
      setCustomerPhone('');
      setPaymentAmount('');
    }
  };

  const filtered = products || [];

  return (
    <PanelContainer title={t('sales.title')}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('stock.search')}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered?.map(p => (
              <button
                key={`prod-${p.code}`}
                onClick={() => addToCart(p)}
                disabled={p.quantity <= 0}
                className={`p-4 rounded-2xl border transition-all text-left h-32 ${p.quantity <= 0 ? 'bg-slate-100 opacity-50' : 'bg-white hover:border-blue-500'}`}
              >
                <h3 className="font-semibold truncate">{p.name}</h3>
                <p className="text-xs text-slate-400 truncate">{p.code}</p>
                <div className="mt-auto flex justify-between items-end">
                  <span className="font-bold text-blue-600">${p.price}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-600">{p.quantity} disp.</span>
                </div>
              </button>
            ))}
            {!filtered || filtered.length === 0 ? (
              <p className="col-span-full text-center py-8 text-slate-400">No hay productos disponibles</p>
            ) : null}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col h-fit sticky top-4">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold">{t('sales.cart')}</h2>
          </div>
          <div className="p-6 space-y-4 max-h-[40vh] overflow-y-auto">
            {cart?.length === 0 && <p className="text-center py-8 text-slate-400">Vacío</p>}
            {cart?.map(i => (
              <div key={`cart-${i.code}`} className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate">{i.name}</h4>
                  <p className="text-xs text-slate-500">${i.price} x {i.cartQuantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(i.code, -1)} className="p-1 bg-white border rounded-md"><Minus className="w-3 h-3" /></button>
                  <span className="text-sm w-4 text-center">{i.cartQuantity}</span>
                  <button onClick={() => updateQty(i.code, 1)} className="p-1 bg-white border rounded-md"><Plus className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-slate-50 rounded-b-3xl border-t border-slate-100 space-y-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>{t('sales.total')}</span>
              <span className="text-blue-600">${total.toFixed(2)}</span>
            </div>
            <form onSubmit={handleCheckout} className="space-y-3">
              <input type="text" data-testid="input-phone" placeholder="Teléfono Cliente" className="w-full p-2 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
              <input type="number" step="0.01" data-testid="input-payment" placeholder="Monto Recibido" className="w-full p-2 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} required />
              <button type="submit" data-testid="btn-confirm-sale" disabled={processing || cart.length === 0} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                <CheckCircle2 className="w-5 h-5" /> {t('sales.checkout')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </PanelContainer>
  );
};

export default SalesPanel;
