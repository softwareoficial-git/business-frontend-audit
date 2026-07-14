import { create } from 'zustand';

type ConnectionStatus = 'connected' | 'offline' | 'unconfigured';

interface ConnectionState {
  status: ConnectionStatus;
  setStatus: (status: ConnectionStatus) => void;
  checkConnection: () => Promise<void>;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  status: 'unconfigured',
  setStatus: (status) => set({ status }),
  checkConnection: async () => {
    try {
      // Hacemos una petición simple para verificar el servidor
      // Usamos un endpoint que no requiera auth para el check rápido
      await fetch('/api/health').catch(() => { throw new Error('Offline') });
      set({ status: 'connected' });
    } catch (e) {
      // Si falla, verificamos si es porque no hay servidor o porque está caído
      // Para efectos de este frontend, si falla el fetch es 'offline'
      set({ status: 'offline' });
    }
  },
}));
