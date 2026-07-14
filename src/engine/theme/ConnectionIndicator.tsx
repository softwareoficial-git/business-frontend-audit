import { useConnectionStore } from './connectionStore';
import { useOfflineStore } from '../../store/offlineStore';

export const ConnectionIndicator = () => {
  const { status } = useConnectionStore();
  const { queue } = useOfflineStore();

  const statusConfigs = {
    connected: { color: 'bg-blue-500', text: 'Conectado', label: 'Online' },
    offline: { color: 'bg-red-500', text: 'Desconectado', label: 'Offline' },
    unconfigured: { color: 'bg-yellow-500', text: 'No Configurado', label: 'Unconfigured' },
    authenticated: { color: 'bg-green-500', text: 'Sesión Activa', label: 'Authenticated' },
  };

  const config = statusConfigs[status];

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-sm transition-all animate-in fade-in slide-in-from-top-2">
        <div className={`w-2 h-2 rounded-full ${config.color} animate-pulse`} />
        <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-600">
          {config.label}: <span className={status === 'authenticated' ? 'text-green-600' : status === 'connected' ? 'text-blue-600' : 'text-red-600'}>{config.text}</span>
        </span>
      </div>

      {queue.length > 0 && (
        <div className="px-3 py-1 rounded-full bg-orange-500 text-white text-[9px] font-bold uppercase tracking-tighter shadow-sm animate-bounce">
          {queue.length} Pendientes de Sincronizar
        </div>
      )}
    </div>
  );
};
