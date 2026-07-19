'use client';

import { useState } from 'react';
import { loginUser } from '../../lib/auth';
import { auditLog } from '../../lib/auditLogger';
import { useLoading } from '../loading/LoadingProvider';

export default function LoginPage({
  onNavigate,
  onLoginSuccess,
}: {
  onNavigate: (view: 'home' | 'login' | 'register') => void;
  onLoginSuccess: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    global?: string;
  }>({});
  const { startLoading, stopLoading } = useLoading();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};
    if (!username) {
      newErrors.username = 'Falta este campo';
      auditLog('Validación Login: Campo username vacío', 'warn');
    }
    if (!password) {
      newErrors.password = 'Falta este campo';
      auditLog('Validación Login: Campo password vacío', 'warn');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    startLoading();
    auditLog(`Iniciando login para: ${username}`);
    const result = await loginUser(username, password);
    stopLoading();

    if (result.success) {
      auditLog('Login exitoso', 'info');
      onLoginSuccess();
    } else {
      const errorMsg =
        result.message === 'INVALID_CREDENTIALS'
          ? 'Usuario o contraseña incorrectos.'
          : 'Ha ocurrido un error. Intenta más tarde.';
      setErrors({ global: errorMsg });
      auditLog(`Error en login: ${errorMsg}`, 'error');
    }
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Iniciar Sesión</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {errors.username && (
          <p style={{ color: 'red', margin: '0', fontSize: '0.8rem' }}>
            {errors.username}
          </p>
        )}

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && (
          <p style={{ color: 'red', margin: '0', fontSize: '0.8rem' }}>
            {errors.password}
          </p>
        )}

        <button type="submit" style={{ marginTop: '0.5rem' }}>
          Entrar
        </button>
      </form>
      {errors.global && <p style={{ color: 'red' }}>{errors.global}</p>}
      <p>
        ¿No tienes cuenta?{' '}
        <button onClick={() => onNavigate('register')}>Regístrate</button>
      </p>
    </main>
  );
}
