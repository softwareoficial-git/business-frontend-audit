'use client';

import { useState } from 'react';
import { registerUser, loginUser } from '../../lib/auth';

export default function RegisterPage({
  onNavigate,
  onLoginSuccess,
}: {
  onNavigate: (view: 'home' | 'login' | 'register') => void;
  onLoginSuccess: () => void;
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
      // Auto-login post-registro
      const loginResult = await loginUser(username, password);
      if (loginResult.success) {
        if (loginResult.user?.token) {
          localStorage.setItem('session_token', loginResult.user.token);
        }
        onLoginSuccess();
      } else {
        onNavigate('login');
      }
    } else {
      let globalError = 'Error en registro. Intenta de nuevo.';
      if (
        result.message &&
        typeof result.message === 'string' &&
        result.message.includes('already exists')
      )
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
    padding: '1.5rem',
    borderRadius: '20px',
    boxShadow:
      '6px 6px 12px rgba(0, 0, 0, 0.1), -6px -6px 12px rgba(255, 255, 255, 0.5)',
    width: '90%',
    maxWidth: '300px',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.6rem',
    margin: '0.4rem 0',
    borderRadius: '10px',
    border: '1px solid var(--color-border)',
    fontSize: '0.8rem',
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
    outline: 'none',
    boxSizing: 'border-box', // Importante para que el padding no afecte el ancho
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1
          style={{
            textAlign: 'center',
            marginBottom: '0.5rem',
            color: 'var(--color-text)',
            fontSize: '1.5rem',
          }}
        >
          Crear cuenta
        </h1>
        <p
          style={{
            textAlign: 'center',
            color: 'var(--color-secondary)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
          }}
        >
          Regístrate para empezar.
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
          <button type="submit" disabled={loading} className="btn-primary">
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
          <button onClick={() => onNavigate('login')} className="btn-text">
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
}
