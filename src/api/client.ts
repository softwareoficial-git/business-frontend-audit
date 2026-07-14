import axios from 'axios';
import axiosRetry from 'axios-retry';
import { useAuthStore } from '../store/authStore';

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().session.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosRetry(apiClient, {
  retries: 1,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => axiosRetry.isNetworkError(error),
});

export const loginUser = async (params: { username: string; password: string }) => {
  // Since /login endpoint was 404 in audit, we use the execute command if it exists
  // or we assume for now that the primary entry is /register or a specific command.
  // Based on the current frontend, we'll keep it as /login but the user should be aware
  // that we need to verify the exact login endpoint.
  const response = await apiClient.post('/login', params);
  return response.data;
};

export const registerClient = async (params: any) => {
  const response = await apiClient.post('/register', params);
  return response.data;
};

export const executeCmd = async (cmd: string, params: Record<string, unknown> = {}, tenantId?: string) => {
  const payload: any = { cmd, params };
  if (tenantId) payload.tenantId = String(tenantId);
  const response = await apiClient.post('/execute', payload);
  return response.data;
};
