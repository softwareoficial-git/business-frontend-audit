import { useState, useCallback } from 'react';
import { executeCmd } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../engine/toast/store';

export const useStockLogic = () => {
  const { session } = useAuthStore();
  const { addToast } = useToastStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStock = useCallback(async () => {
    setLoading(true);
    try {
      const res = await executeCmd('stock.list', {}, session.tenantId || '');
      const productsData = res?.data || [];
      setProducts(productsData);
    } catch (err) {
      addToast({ message: 'Error al cargar el inventario', type: 'error' });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [session.tenantId, addToast]);

  const addProduct = async (product: any) => {
    try {
      const res = await executeCmd('stock.add', {
        code: product.code,
        name: product.name,
        price: parseFloat(product.price),
        qty: parseInt(product.quantity),
      }, session.tenantId || '');

      if (res && res.success) {
        addToast({ message: 'Producto agregado con éxito', type: 'success' });
        await fetchStock();
        return { success: true };
      } else {
        addToast({ message: res?.message || 'Error al guardar', type: 'error' });
        return { success: false, message: res?.message };
      }
    } catch (err) {
      addToast({ message: 'Error de conexión al guardar', type: 'error' });
      return { success: false };
    }
  };

  return {
    products,
    loading,
    fetchStock,
    addProduct,
  };
};
