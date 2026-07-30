const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('session_token')
      : null;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include',
    });
    return response;
  } catch (error) {
    console.error('[API Error] Network failure:', error);
    // Devolvemos un objeto que simula una respuesta de error para que 
    // los componentes no fallen catastróficamente.
    return {
      ok: false,
      status: 503,
      json: async () => ({ success: false, message: 'Servicio no disponible (Offline)' }),
    } as Response;
  }
};

export const getSalesSummary = async () => {
  const response = await apiClient('/execute', {
    method: 'POST',
    body: JSON.stringify({
      cmd: 'sales.summary',
      params: {},
    }),
  });
  return response.json();
};

export const getSalesHistory = async () => {
  const response = await apiClient('/execute', {
    method: 'POST',
    body: JSON.stringify({
      cmd: 'sales.history',
      params: {},
    }),
  });
  return response.json();
};
