const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  });

  return response;
};
