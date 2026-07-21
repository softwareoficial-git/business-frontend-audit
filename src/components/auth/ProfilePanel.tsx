'use client';

import { useState } from 'react';

interface ProfilePanelProps {
  user: any;
  onClose: () => void;
}

export default function ProfilePanel({ user, onClose }: ProfilePanelProps) {
  const plan = user.role_name === 'DUEÑO' ? 'PRO' : 'FREEMIUM';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-background)',
          padding: '2rem',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '400px',
          color: 'var(--color-text)',
          fontFamily: 'sans-serif',
          border: '1px solid var(--color-border)',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Mi Cuenta</h2>
        <div style={{ marginBottom: '1rem' }}>
          <p>
            <strong>Usuario:</strong> {user.username}
          </p>
          <p>
            <strong>Denominación:</strong> {user.cliente_nombre}
          </p>
          <p>
            <strong>Rol:</strong> {user.role_name}
          </p>
          <p>
            <strong>Plan Actual:</strong>{' '}
            <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
              {plan}
            </span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="btn-secondary"
          style={{ width: '100%' }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
