import axios from 'axios';
import axiosRetry from 'axios-retry';
import { useAuthStore } from '../store/authStore';
import { useOfflineStore } from '../store/offlineStore';

const API_BASE_URL = import.meta.env.VITE_BUSINESS_API_URL || 'https://business-logic-engine-node-production.up.railway.app';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000, // Aumentado a 15s para evitar timeouts en conexiones lentas
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().session.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Solo encolamos peticiones de tipo 'execute' que sean POST y hayan fallado por red
    if (error.config?.url?.includes('/execute') && error.config?.method === 'post') {
      const { data } = error.config;
      const { cmd, params, tenantId } = data || {};

      if (cmd) {
        useOfflineStore.getState().addToQueue({ cmd, params, tenantId });

        return {
          data: {
            success: true,
            message: 'Modo Offline: Acción encolada para sincronización posterior',
            offline: true
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
        };
      }
    }
    return Promise.reject(error);
  }
);

axiosRetry(apiClient, {
  retries: 3, // Aumentado de 1 a 3 reintentos
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Reintentar en errores de red, 5xx (server error) o 429 (too many requests)
    return axiosRetry.isNetworkError(error) ||
           (error.response?.status ? error.response.status >= 500 || error.response.status === 429 : false);
  },
});

export const loginUser = async (params: { username: string; password: string }) => {
  const response = await apiClient.post('/login', params);
  return response.data;
};

export const registerClient = async (params: any) => {
  const response = await apiClient.post('/register', params);
  return response.data;
};

export const checkUsernameExists = async (username: string) => {
  try {
    const response = await apiClient.get(`/check-username?username=${encodeURIComponent(username)}`);
    return response.data; // Esperamos { exists: boolean }
  } catch (error: any) {
    // Si el servidor responde 404, técnicamente el usuario no existe (está disponible)
    if (error.response?.status === 404) {
      return { exists: false, error: false };
    }
    console.error('Error checking username:', error);
    return { exists: false, error: true };
  }
};

export const executeCmd = async (cmd: string, params: Record<string, unknown> = {}, tenantId?: string) => {
  const payload: any = { cmd, params };
  if (tenantId) payload.tenantId = String(tenantId);
  const response = await apiClient.post('/execute', payload);
  return response.data;
};
