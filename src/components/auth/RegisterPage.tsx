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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};
    if (!username) {
      newErrors.username = 'Falta este campo';
      auditLog('Validación Registro: Campo username vacío', 'warn');
    }
    if (!password) {
      newErrors.password = 'Falta este campo';
      auditLog('Validación Registro: Campo password vacío', 'warn');
    }
    if (!nombreCliente) {
      newErrors.nombreCliente = 'Falta este campo';
      auditLog('Validación Registro: Campo nombreCliente vacío', 'warn');
    }

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
      else if (result.message === 'INVALID_PAYLOAD')
        globalError = 'La contraseña es demasiado corta.';
      setErrors({ global: globalError });
      auditLog(`Error en registro: ${globalError}`, 'error');
    }
    setLoading(false);
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Registrarse</h1>
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
          placeholder="Contraseña (mín 6)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && (
          <p style={{ color: 'red', margin: '0', fontSize: '0.8rem' }}>
            {errors.password}
          </p>
        )}

        <input
          type="text"
          placeholder="Nombre de Cliente"
          value={nombreCliente}
          onChange={(e) => setNombreCliente(e.target.value)}
        />
        {errors.nombreCliente && (
          <p style={{ color: 'red', margin: '0', fontSize: '0.8rem' }}>
            {errors.nombreCliente}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: '0.5rem' }}
        >
          {loading ? 'Cargando...' : 'Registrarse'}
        </button>
      </form>
      {errors.global && <p style={{ color: 'red' }}>{errors.global}</p>}
      <p>
        ¿Ya tienes cuenta?{' '}
        <button onClick={() => onNavigate('login')}>Iniciar Sesión</button>
      </p>
    </main>
  );
}
