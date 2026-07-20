'use client';

import { useState } from 'react';
import { registerUser } from '../../lib/auth';

export default function RegisterPage({
  onNavigate,
}: {
  onNavigate: (view: 'home' | 'login' | 'register') => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    nombreCliente?: string;
    global?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!username) newErrors.username = 'Falta este campo';
    if (password.length < 6)
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    if (!nombreCliente) newErrors.nombreCliente = 'Falta este campo';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const result = await registerUser(username, password, nombreCliente);

    if (result.success) {
      onNavigate('login');
    } else {
      let globalError = 'Error en registro. Intenta de nuevo.';
      if (result.message === 'USER_EXISTS')
        globalError = 'El usuario ya existe.';
      setErrors({ global: globalError });
    }
    setLoading(false);
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

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '1rem',
    fontWeight: 'bold',
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
          Crear cuenta
        </h1>
        <p
          style={{
            textAlign: 'center',
            color: 'var(--color-secondary)',
            marginBottom: '2rem',
          }}
        >
          Regístrate para empezar a gestionar tus productos.
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
            <p
              style={{
                color: 'var(--color-error)',
                fontSize: '0.8rem',
                marginTop: '-0.4rem',
              }}
            >
              {errors.username}
            </p>
          )}
          <input
            type="password"
            placeholder="Contraseña (mín 6)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          {errors.password && (
            <p
              style={{
                color: 'var(--color-error)',
                fontSize: '0.8rem',
                marginTop: '-0.4rem',
              }}
            >
              {errors.password}
            </p>
          )}
          <input
            type="text"
            placeholder="Nombre de Cliente"
            value={nombreCliente}
            onChange={(e) => setNombreCliente(e.target.value)}
            style={inputStyle}
          />
          {errors.nombreCliente && (
            <p
              style={{
                color: 'var(--color-error)',
                fontSize: '0.8rem',
                marginTop: '-0.4rem',
              }}
            >
              {errors.nombreCliente}
            </p>
          )}
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Registrando...' : 'Registrarse'}
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
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={() => onNavigate('login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
}
