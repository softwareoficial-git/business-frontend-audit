'use client';

import { useState } from 'react';
import { registerUser } from '../../lib/auth';
import { auditLog } from '../../lib/auditLogger';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};
    if (!username) newErrors.username = 'Falta este campo';
    if (!password) newErrors.password = 'Falta este campo';
    if (!nombreCliente) newErrors.nombreCliente = 'Falta este campo';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    fontFamily: 'sans-serif',
  };

  const cardStyle: React.CSSProperties = {
    background: 'white',
    padding: '2.5rem',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    margin: '0.5rem 0',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    background: '#00c853',
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
        <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          Crear cuenta
        </h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
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
            <p style={{ color: 'red', fontSize: '0.8rem' }}>
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
            <p style={{ color: 'red', fontSize: '0.8rem' }}>
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
            <p style={{ color: 'red', fontSize: '0.8rem' }}>
              {errors.nombreCliente}
            </p>
          )}
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        {errors.global && (
          <p style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>
            {errors.global}
          </p>
        )}
        <p
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            fontSize: '0.9rem',
          }}
        >
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={() => onNavigate('login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#00c853',
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
