import { setCookie, getCookie } from './cookies';

export const loginUser = async (username, password) => {
  // Simulación: Guardar usuario en localStorage
  localStorage.setItem('user', JSON.stringify({ username }));
  return { success: true, user: { username } };
};

export const registerUser = async (username, password, nombreCliente) => {
  return { success: true };
};

export const getProfile = async () => {
  const user = localStorage.getItem('user');
  return user
    ? { success: true, profile: JSON.parse(user) }
    : { success: false };
};

export const logoutUser = async () => {
  localStorage.removeItem('user');
  return { success: true };
};
