import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PendingAction {
  id: string;
  cmd: string;
  params: any;
  tenantId?: string;
  timestamp: number;
}

interface OfflineState {
  queue: PendingAction[];
  isSyncing: boolean;
  addToQueue: (action: Omit<PendingAction, 'id' | 'timestamp'>) => void;
  removeFromQueue: (id: string) => void;
  setSyncing: (syncing: boolean) => void;
  clearQueue: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      queue: [],
      isSyncing: false,
      addToQueue: (action) => set((state) => ({
        queue: [
          ...state.queue,
          {
            ...action,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
          },
        ],
      })),
      removeFromQueue: (id) => set((state) => ({
        queue: state.queue.filter((a) => a.id !== id),
      })),
      setSyncing: (syncing) => set({ isSyncing: syncing }),
      clearQueue: () => set({ queue: [] }),
    }),
    { name: 'business-offline-queue' }
  )
);
