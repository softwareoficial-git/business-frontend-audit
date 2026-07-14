import { useState, useCallback } from 'react';
import { executeCmd } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../engine/toast/store';

export const useReportsLogic = () => {
  const { session } = useAuthStore();
  const { addToast } = useToastStore();
  const [stats, setStats] = useState({ totalRevenue: 0, totalSales: 0, inventoryValue: 0 });
  const [loading, setLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const reportRes = await executeCmd('staff.report', {}, session.tenantId || '');
      const stockRes = await executeCmd('products.list', {}, session.tenantId || '');

      const stock = stockRes?.data?.results || [];
      const invValue = stock.reduce((sum: number, p: any) => sum + (Number(p.price) * Number(p.quantity)), 0);

      setStats({
        totalRevenue: reportRes.data?.total_revenue || 0,
        totalSales: reportRes.data?.total_sales || 0,
        inventoryValue: invValue,
      });
    } catch (e) {
      addToast({ message: 'Error al generar reportes', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [session.tenantId, addToast]);

  return {
    stats,
    loading,
    fetchReports,
  };
};
