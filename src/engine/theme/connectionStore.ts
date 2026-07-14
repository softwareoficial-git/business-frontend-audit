import { create } from 'zustand';
import { useAuthStore } from '../../store/authStore';
import { useOfflineStore } from '../../store/offlineStore';
import { executeCmd } from '../../api/client';

type ConnectionStatus = 'connected' | 'offline' | 'unconfigured' | 'authenticated';

interface ConnectionState {
  status: ConnectionStatus;
  setStatus: (status: ConnectionStatus) => void;
  checkConnection: () => Promise<void>;
  syncOfflineQueue: () => Promise<void>;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  status: 'unconfigured',
  setStatus: (status) => set({ status }),
  checkConnection: async () => {
    try {
      await fetch('/api/health').catch(() => { throw new Error('Offline') });

      // Si hay red, verificamos si hay sesión
      const { session } = useAuthStore.getState();
      if (session.isAuthenticated) {
        set({ status: 'authenticated' });
      } else {
        set({ status: 'connected' });
      }
    } catch (e) {
      set({ status: 'offline' });
    }
  },
  syncOfflineQueue: async () => {
    const { queue, isSyncing } = useOfflineStore.getState();
    if (queue.length === 0 || isSyncing) return;

    useOfflineStore.getState().setSyncing(true);
    console.log(`🔄 Sincronizando ${queue.length} acciones pendientes...`);

    try {
      for (const action of queue) {
        try {
          await executeCmd(action.cmd, action.params, action.tenantId);
          useOfflineStore.getState().removeFromQueue(action.id);
        } catch (err) {
          console.error(`❌ Error sincronizando acción ${action.id}:`, err);
          // Si falla una acción, detenemos la sincronización para mantener el orden cronológico
          break;
        }
      }
    } finally {
      useOfflineStore.getState().setSyncing(false);
    }
  },
}));
