import axios from 'axios';
import axiosRetry from 'axios-retry';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_BUSINESS_API_URL || 'https://business-logic-engine-node-production.up.railway.app';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
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
