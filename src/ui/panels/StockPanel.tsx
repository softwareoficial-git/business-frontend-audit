import React, { useState, useEffect } from 'react';
import { PackagePlus, Search, Box, X, Save } from 'lucide-react';
import { useStockLogic } from '../../bridge/hooks/useStockLogic';
import { PanelContainer } from '../../engine/panels/PanelContainer';
import { useTranslate } from '../../engine/i18n/i18nStore';

const StockPanel = () => {
  const t = useTranslate();
  const { products, loading, fetchStock, addProduct } = useStockLogic();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ code: '', name: '', price: '', quantity: '', category: '' });

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await addProduct(formData);
    if (res?.success) {
      setIsModalOpen(false);
      setFormData({ code: '', name: '', price: '', quantity: '', category: '' });
    }
  };

  const filtered = (products || []).filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PanelContainer title={t('stock.title')}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">{t('stock.total')}: {filtered.length}</div>
          <button 
            data-testid="btn-add-product"
            onClick={() => setIsModalOpen(true)} 
            className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            <PackagePlus className="w-6 h-6" />
          </button>
        </div>

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

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <div key={p.code} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-500 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                    <Box className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{p.name}</h3>
                    <p className="text-xs text-slate-400">{p.code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">${p.price}</div>
                  <div className={`text-xs ${p.quantity < 5 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                    {p.quantity} disp.
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full rounded-3xl shadow-2xl p-6 relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-400"><X className="w-6 h-6" /></button>
              <h2 className="text-xl font-bold mb-6">{t('stock.addProduct')}</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input required data-testid="modal-code" placeholder={t('stock.code')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                  <input required data-testid="modal-cat" placeholder={t('stock.category')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                </div>
                <input required data-testid="modal-name" placeholder={t('stock.name')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" step="0.01" required data-testid="modal-price" placeholder={t('stock.price')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                  <input type="number" required data-testid="modal-qty" placeholder={t('stock.quantity')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
                </div>
                <button type="submit" data-testid="btn-save-product" className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all mt-4 shadow-lg shadow-blue-200">
                  <Save className="w-5 h-5" /> {t('stock.save')}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </PanelContainer>
  );
};

export default StockPanel;
