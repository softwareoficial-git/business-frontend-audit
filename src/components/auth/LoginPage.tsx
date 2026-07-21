'use client';

import { useState } from 'react';
import { loginUser } from '../../lib/auth';
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
    if (!username) newErrors.username = 'Falta este campo';
    if (!password) newErrors.password = 'Falta este campo';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    startLoading();
    const result = await loginUser(username, password);
    stopLoading();

    if (result.success) {
      onLoginSuccess();
    } else {
      setErrors({ global: 'Usuario o contraseña incorrectos.' });
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '2rem',
    backgroundColor: 'var(--color-background)',
    fontFamily: 'sans-serif',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-background)',
    padding: '2.5rem',
    borderRadius: '16px',
    boxShadow: 'var(--shadow-soft)',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid var(--color-border)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    margin: '0.5rem 0',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    fontSize: '1rem',
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1
          style={{
            textAlign: 'center',
            marginBottom: '0.5rem',
            color: 'var(--color-text)',
          }}
        >
          Bienvenido
        </h1>
        <p
          style={{
            textAlign: 'center',
            color: 'var(--color-secondary)',
            marginBottom: '2rem',
          }}
        >
          Por favor, inicia sesión para acceder a tu panel de control.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
          />
          {errors.username && (
            <p style={{ color: 'var(--color-error)', fontSize: '0.8rem' }}>
              {errors.username}
            </p>
          )}
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          {errors.password && (
            <p style={{ color: 'var(--color-error)', fontSize: '0.8rem' }}>
              {errors.password}
            </p>
          )}
          <button type="submit" className="btn-primary">
            Entrar
          </button>
        </form>
        {errors.global && (
          <p
            style={{
              color: 'var(--color-error)',
              textAlign: 'center',
              marginTop: '1rem',
            }}
          >
            {errors.global}
          </p>
        )}
        <p
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            fontSize: '0.9rem',
            color: 'var(--color-text)',
          }}
        >
          ¿No tienes cuenta?{' '}
          <button onClick={() => onNavigate('register')} className="btn-text">
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
}
