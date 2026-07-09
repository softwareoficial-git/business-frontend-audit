import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserSession {
  token: string | null;
  tenantId: string | null;
  username: string | null;
  role: string | null;
  isAuthenticated: boolean;
}

interface AuthStore {
  session: UserSession;
  setSession: (session: UserSession) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      session: {
        token: null,
        tenantId: null,
        username: null,
        role: null,
        isAuthenticated: false,
      },
      setSession: (session) => set({ session }),
      clearSession: () => set({ 
        session: { token: null, tenantId: null, username: null, role: null, isAuthenticated: false } 
      }),
    }),
    { name: 'business-auth-storage' }
  )
);
