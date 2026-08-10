'use client';

import React, { useEffect, useState } from 'react';
import { getProfile } from '../../lib/auth';

interface ProfilePanelProps {
  user: any;
  onUpdateUser: (user: any) => void;
  onClose?: () => void;
}

const PaymentMethods = ({
  clienteId,
  targetPlan,
  onPaymentSuccess,
}: {
  clienteId: number;
  targetPlan: string;
  onPaymentSuccess: () => void;
}) => {
  const simulateChangePlan = async () => {
    try {
      // Corregido: Apuntando al puerto 3001 donde escucha el backend
      const response = await fetch(
        'http://localhost:3001/api/billing/simulate-payment',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({ clienteId, plan: targetPlan }),
        }
      );

      if (response.ok) {
        alert(`Plan cambiado exitosamente a: ${targetPlan}`);
        onPaymentSuccess();
      } else {
        alert('Error en la simulación');
      }
    } catch (e) {
      alert('Error de conexión con el backend');
    }
  };

  return (
    <div
      style={{
        marginTop: '1rem',
        padding: '1rem',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <p style={{ fontWeight: 'bold' }}>Simular pago / cambio:</p>
      <button
        onClick={simulateChangePlan}
        style={{
          width: '100%',
          margin: '0.5rem 0',
          padding: '0.5rem',
          background: '#e0f7fa',
          cursor: 'pointer',
          border: '1px solid #00acc1',
        }}
      >
        [SIMULADOR] Cambiar a {targetPlan.toUpperCase()}
      </button>
    </div>
  );
};

const PricingCard = ({
  clienteId,
  title,
  price,
  features,
  isPro,
  isCurrent,
  canUpgrade,
  onPaymentSuccess,
}: {
  clienteId: number;
  title: string;
  price: string;
  features: string[];
  isPro?: boolean;
  isCurrent?: boolean;
  canUpgrade?: boolean;
  onPaymentSuccess: () => void;
}) => {
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div
      style={{
        padding: '1rem',
        border: `2px solid ${isPro ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: '12px',
        background: isPro
          ? 'linear-gradient(135deg, var(--color-primary-light), white)'
          : 'white',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h3
        style={{
          marginTop: 0,
          color: isPro ? 'var(--color-primary)' : 'inherit',
        }}
      >
        {title} {isCurrent && '(Actual)'}
      </h3>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
        {price}
      </p>
      <ul style={{ fontSize: '0.9rem', paddingLeft: '1.2rem', flexGrow: 1 }}>
        {features.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
      {/* El botón de acción aparece siempre para poder cambiar bidireccionalmente en el simulador */}
      {!isCurrent && (
        <button
          onClick={() => setShowPayment(!showPayment)}
          style={{
            marginTop: '1rem',
            padding: '0.5rem',
            borderRadius: '4px',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {showPayment ? 'Ocultar opciones' : 'Cambiar plan'}
        </button>
      )}
      {showPayment && (
        <PaymentMethods
          clienteId={clienteId}
          targetPlan={isPro ? 'pro' : 'free'}
          onPaymentSuccess={onPaymentSuccess}
        />
      )}
    </div>
  );
};

const PricingComparison = ({
  clienteId,
  currentPlan,
  onPaymentSuccess,
}: {
  clienteId: number;
  currentPlan: string;
  onPaymentSuccess: () => void;
}) => (
  <div style={{ marginTop: '2rem' }}>
    <h3 style={{ marginBottom: '1rem' }}>Planes Disponibles</h3>
    <div
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}
    >
      <PricingCard
        clienteId={clienteId}
        title="Free"
        price="$0"
        isCurrent={currentPlan === 'free'}
        onPaymentSuccess={onPaymentSuccess}
        features={['Stock básico', 'Ventas básicas']}
      />
      <PricingCard
        clienteId={clienteId}
        title="Pro"
        price="$29/mes"
        isPro
        isCurrent={currentPlan === 'pro'}
        onPaymentSuccess={onPaymentSuccess}
        features={[
          'Todo lo de Free',
          'Gestión de empleados',
          'Reportes y estadísticas',
          'Auditoría y alertas',
        ]}
      />
    </div>
  </div>
);

const OwnerSubscriptionView = ({ subscription }: { subscription: any }) => {
  console.log('Subscription Data Received:', subscription);
  const expiryDate =
    subscription.trial_end_date || subscription.subscription_end;
  const daysRemaining = subscription.days_remaining;

  return (
    <div
      style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'var(--color-background-secondary)',
        borderRadius: '8px',
      }}
    >
      <h3 style={{ marginTop: 0 }}>Gestión de Suscripción</h3>
      <p>
        <strong>Plan:</strong> {subscription.plan?.toUpperCase() || 'N/A'}
      </p>
      <p>
        <strong>Estado:</strong>{' '}
        {subscription.is_trial ? 'Periodo de Prueba' : 'Activo'}
      </p>
      <p>
        <strong>Expira:</strong>{' '}
        {expiryDate
          ? new Date(expiryDate).toLocaleDateString()
          : daysRemaining !== undefined
            ? `En ${daysRemaining} días`
            : 'N/A'}
      </p>
      <button
        className="btn-primary"
        style={{ width: '100%', marginTop: '0.5rem' }}
      >
        Gestionar Pagos
      </button>
    </div>
  );
};

const EmployeeView = ({ ownerInfo }: { ownerInfo: any }) => (
  <div
    style={{
      marginTop: '1.5rem',
      padding: '1rem',
      background: 'var(--color-background-secondary)',
      borderRadius: '8px',
    }}
  >
    <h3 style={{ marginTop: 0 }}>Información de la Empresa</h3>
    <p>
      <strong>Dueño:</strong> {ownerInfo?.name || 'No disponible'}
    </p>
    <p>Si tienes problemas, contacta al dueño.</p>
  </div>
);

export default function ProfilePanel({
  user,
  onUpdateUser,
}: ProfilePanelProps) {
  useEffect(() => {
    const refreshData = async () => {
      const result = await getProfile();
      if (result.success) {
        onUpdateUser(result.profile);
      }
    };
    refreshData();
  }, [onUpdateUser]);

  console.log('ProfilePanel received user:', user);

  const isOwner = user.role_name === 'DUEÑO';
  const currentPlan = user.subscription?.plan || 'free';
  const clienteId = user.cliente_id;

  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'left',
        color: 'var(--color-text)',
      }}
    >
      <h2 style={{ marginTop: 0 }}>Mi Perfil</h2>
      <div style={{ marginBottom: '1.5rem' }}>
        <p>
          <strong>Usuario:</strong> {user.username}
        </p>
        <p>
          <strong>Empresa:</strong> {user.cliente_nombre}
        </p>
        <p>
          <strong>Rol:</strong> {user.role_name}
        </p>
      </div>

      {isOwner ? (
        <>
          <OwnerSubscriptionView subscription={user.subscription || {}} />
          <PricingComparison
            clienteId={clienteId}
            currentPlan={currentPlan}
            onPaymentSuccess={() => {
              // Recargar datos para reflejar el cambio
              window.location.reload();
            }}
          />
        </>
      ) : (
        <EmployeeView ownerInfo={user.ownerContact} />
      )}
    </div>
  );
}
