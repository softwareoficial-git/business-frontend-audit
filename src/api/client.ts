import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BUSINESS_API_URL,
});

export const registerClient = async (params: { 
  client_name: string; 
  owner_email: string; 
  username: string; 
  password: string; 
  nombreCliente: string 
}) => {
  try {
    const response = await apiClient.post('/register', params);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error(`API Error [/register]:`, JSON.stringify(error.response.data, null, 2));
      throw error.response.data;
    }
    throw error;
  }
};

export const executeCmd = async (cmd: string, params: Record<string, unknown> = {}, tenantId: string) => {
  try {
    const response = await apiClient.post('/execute', {
      cmd,
      params,
      tenantId: String(tenantId),
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error(`API Error [${cmd}]:`, JSON.stringify(error.response.data, null, 2));
      throw error.response.data;
    }
    throw error;
  }
};
