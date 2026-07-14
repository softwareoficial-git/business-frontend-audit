import React, { useEffect } from 'react';
import { TrendingUp, DollarSign, Package, Users, Loader2, ArrowUpRight } from 'lucide-react';
import { useReportsLogic } from '../../bridge/hooks/useReportsLogic';
import { PanelContainer } from '../../engine/panels/PanelContainer';
import { useTranslate } from '../../engine/i18n/i18nStore';

const ReportsPanel = () => {
  const t = useTranslate();
  const { stats, loading, fetchReports } = useReportsLogic();

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <PanelContainer title={t('reports.title')}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">Datos actualizados en tiempo real</div>
          <button onClick={fetchReports} className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all flex items-center gap-2">
            <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard icon={DollarSign} label={t('reports.revenue')} value={`$${stats.totalRevenue.toFixed(2)}`} color="text-green-600" bg="bg-green-50" />
              <MetricCard icon={TrendingUp} label="Ventas" value={stats.totalSales.toString()} color="text-blue-600" bg="bg-blue-50" />
              <MetricCard icon={Package} label={t('reports.stockValue')} value={`$${stats.inventoryValue.toFixed(2)}`} color="text-purple-600" bg="bg-purple-50" />
              <MetricCard icon={Users} label="Clientes" value={stats.totalSales.toString()} color="text-orange-600" bg="bg-orange-50" />
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" /> Análisis de Rendimiento
                </h2>
                <span className="text-xs font-medium text-slate-400">Últimos 30 días</span>
              </div>
              <div className="h-64 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <ArrowUpRight className="w-8 h-8 opacity-20" />
                <p className="text-sm">Gráfica de ventas en desarrollo...</p>
              </div>
            </div>
          </>
        )}
      </div>
    </PanelContainer>
  );
};

const MetricCard = ({ icon: Icon, label, value, color, bg }: { icon: React.ElementType, label: string, value: string, color: string, bg: string }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-blue-500 transition-all">
    <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}><Icon className="w-6 h-6" /></div>
    <div><p className="text-xs font-medium text-slate-400">{label}</p><p className="text-xl font-bold text-gray-900">{value}</p></div>
  </div>
);

export default ReportsPanel;
