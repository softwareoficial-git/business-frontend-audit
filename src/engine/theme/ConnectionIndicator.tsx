import { useConnectionStore } from './connectionStore';

export const ConnectionIndicator = () => {
  const { status } = useConnectionStore();

  const statusConfigs = {
    connected: { color: 'bg-green-500', text: 'Conectado', label: 'Online' },
    offline: { color: 'bg-red-500', text: 'Desconectado', label: 'Offline' },
    unconfigured: { color: 'bg-yellow-500', text: 'No Configurado', label: 'Unconfigured' },
  };

  const config = statusConfigs[status];

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-sm transition-all animate-in fade-in slide-in-from-top-2">
      <div className={`w-2 h-2 rounded-full ${config.color} animate-pulse`} />
      <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-600">
        {config.label}: <span className={status === 'connected' ? 'text-green-600' : 'text-red-600'}>{config.text}</span>
      </span>
    </div>
  );
};
