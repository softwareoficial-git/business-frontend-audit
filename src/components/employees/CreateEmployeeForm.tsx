'use client';

import { useState } from 'react';
import { apiClient } from '../../lib/api';

export default function CreateEmployeeForm({
  onEmployeeCreated,
}: {
  onEmployeeCreated: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    nombre?: string;
    global?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!username) newErrors.username = 'Falta el nombre de usuario';
    if (password.length < 6)
      newErrors.password = 'Contraseña (mín 6 caracteres)';
    if (!nombre) newErrors.nombre = 'Falta el nombre del empleado';
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
    try {
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({
          cmd: 'staff.create',
          params: {
            username,
            password,
            nombre: nombre,
            role: 'EMPLEADO',
            type: 'human',
          },
        }),
      });
      const result = await response.json();

      if (result.success) {
        setUsername('');
        setPassword('');
        setNombre('');
        onEmployeeCreated();
      } else {
        let globalError = 'Error al crear empleado.';
        if (
          result.message &&
          typeof result.message === 'string' &&
          result.message.includes('already exists')
        ) {
          globalError = 'El usuario ya existe.';
        }
        setErrors({ global: globalError });
      }
    } catch (err) {
      setErrors({ global: 'Error de conexión.' });
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: '1rem',
        background: 'var(--color-surface)',
        borderRadius: '10px',
      }}
    >
      <h3>Nuevo Empleado</h3>
      <input
        type="text"
        placeholder="Usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', margin: '0.2rem 0' }}
      />
      {errors.username && (
        <p style={{ color: 'red', fontSize: '0.8rem' }}>{errors.username}</p>
      )}
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', margin: '0.2rem 0' }}
      />
      {errors.password && (
        <p style={{ color: 'red', fontSize: '0.8rem' }}>{errors.password}</p>
      )}
      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', margin: '0.2rem 0' }}
      />
      {errors.nombre && (
        <p style={{ color: 'red', fontSize: '0.8rem' }}>{errors.nombre}</p>
      )}
      <button type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
        {loading ? 'Creando...' : 'Crear Empleado'}
      </button>
      {errors.global && (
        <p style={{ color: 'red', marginTop: '0.5rem' }}>{errors.global}</p>
      )}
    </form>
  );
}
