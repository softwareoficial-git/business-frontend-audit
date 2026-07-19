import { setCookie, getCookie } from './cookies';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9002';

// Helper para peticiones autenticadas
const authenticatedFetch = async (cmd, params = {}) => {
  const token = getCookie('session_token');
  if (!token) throw new Error('No session token');

  return fetch(`${API_URL}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ cmd, params }),
  });
};

export const loginUser = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cmd: 'USER:login',
        params: { username, password },
      }),
    });

    const result = await response.json();
    console.log('Respuesta API Login:', result); // Debug

    if (result.success && result.data?.user?.token) {
      setCookie('session_token', result.data.user.token, 1);
      return { success: true, user: result.data.user };
    } else {
      // Retornar mensaje detallado de la API
      const errorMsg =
        result.error?.message || result.message || 'Error en login';
      return { success: false, message: errorMsg };
    }
  } catch (error) {
    return { success: false, message: 'CONNECTION_ERROR' };
  }
};

export const registerUser = async (username, password, nombreCliente) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, nombreCliente }),
    });

    const result = await response.json();

    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        message: result.error?.code || result.message || 'Error en registro',
      };
    }
  } catch (error) {
    return { success: false, message: 'CONNECTION_ERROR' };
  }
};

export const getProfile = async () => {
  try {
    const response = await authenticatedFetch('USER:get-profile');
    const result = await response.json();
    return result.success
      ? { success: true, profile: result.data.profile }
      : { success: false };
  } catch (error) {
    return { success: false };
  }
};

export const logoutUser = async () => {
  try {
    await authenticatedFetch('USER:logout');
    setCookie('session_token', '', -1); // Eliminar cookie
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};
