import { setCookie, getCookie } from './cookies';

// En lugar de apuntar a Railway directamente, usamos el proxy de Next.js
const API_URL = '/api';

// Helper para peticiones autenticadas
const authenticatedFetch = async (cmd, params = {}) => {
  return fetch(`${API_URL}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({ cmd, params }),
    credentials: 'include',
  });
};

export const loginUser = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({
        cmd: 'USER:login',
        params: { username, password },
      }),
      credentials: 'include',
    });

    const text = await response.text();
    console.log('DEBUG: Respuesta cruda API Login:', text);

    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.error('DEBUG: Error parseando JSON de login:', e);
      return {
        success: false,
        message: 'El servidor no devolvió un JSON válido',
      };
    }

    if (result.success) {
      return { success: true, user: result.data.user };
    } else {
      return { success: false, message: result.message || 'Error en login' };
    }
  } catch (error) {
    console.error('DEBUG: Error detallado en login:', error);
    return { success: false, message: 'CONNECTION_ERROR' };
  }
};

export const registerUser = async (username, password, nombreCliente) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({ username, password, nombreCliente }),
      credentials: 'include',
    });

    const result = await response.json();

    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        message: result.message || 'Error en registro',
      };
    }
  } catch (error) {
    console.error('Error detallado en registro:', error);
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
    console.error('Error detallado en getProfile:', error);
    return { success: false };
  }
};

export const logoutUser = async () => {
  try {
    await authenticatedFetch('USER:logout');
    return { success: true };
  } catch (error) {
    console.error('Error detallado en logout:', error);
    return { success: false };
  }
};
