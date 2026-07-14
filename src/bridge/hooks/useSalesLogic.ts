import { useState, useCallback } from 'react';
import { executeCmd } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../engine/toast/store';

export const useSalesLogic = () => {
  const { session } = useAuthStore();
  const { addToast } = useToastStore();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);

  const fetchStock = useCallback(async () => {
    try {
      const res = await executeCmd('stock.list', {}, session.tenantId || '');
      const productsData = res?.data || [];
      setProducts(productsData);
    } catch (e) {
      addToast({ message: 'Error al cargar productos para venta', type: 'error' });
      setProducts([]);
    }
  }, [session.tenantId, addToast]);

  const addToCart = (p: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.code === p.code);
      if (existing) return prev.map(i => i.code === p.code ? { ...i, cartQuantity: i.cartQuantity + 1 } : i);
      return [...prev, { ...p, cartQuantity: 1 }];
    });
  };

  const updateQty = (code: string, delta: number) => {
    setCart(prev => prev.map(i => i.code === code ? { ...i, cartQuantity: Math.max(0, i.cartQuantity + delta) } : i).filter(i => i.cartQuantity > 0));
  };

  const checkout = async (customerPhone: string, paymentAmount: number) => {
    setProcessing(true);
    try {
      const res = await executeCmd('sales.create', {
        customer: `Cliente ${customerPhone}`,
        items: cart.map(i => ({ code: i.code, qty: i.cartQuantity })),
        client_request_id: `REQ-${Date.now()}`,
      }, session.tenantId || '');

      if (res && res.success) {
        addToast({ message: '✅ Venta creada exitosamente', type: 'success' });
        setCart([]);
        await fetchStock();
        return { success: true };
      } else {
        addToast({ message: res?.message || 'Error en la venta', type: 'error' });
        return { success: false, message: res?.message };
      }
    } catch (e) {
      addToast({ message: 'Error de conexión al procesar venta', type: 'error' });
      return { success: false };
    } finally {
      setProcessing(false);
    }
  };

  return {
    products,
    cart,
    processing,
    fetchStock,
    addToCart,
    updateQty,
    checkout,
  };
};
