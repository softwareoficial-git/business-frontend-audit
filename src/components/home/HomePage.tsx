'use client';

import { useState, useEffect } from 'react';
import SalesStatsWidget from './SalesStatsWidget';
import OnboardingGuideWidget from './OnboardingGuideWidget';
import EmployeeTasksWidget from './EmployeeTasksWidget';
import BusinessAlertsWidget from './BusinessAlertsWidget';
import TopProductsWidget from './TopProductsWidget';
import PurchasesListWidget from './PurchasesListWidget';

interface HomePageProps {
  user: any;
  onNavigate?: (view: any) => void;
}

export default function HomePage({ user, onNavigate }: HomePageProps) {
  return (
    <div
      style={{
        padding: 'var(--space-md)',
        height: 'calc(100vh - 80px)',
        overflowY: 'auto',
        textAlign: 'left',
      }}
    >
      <h1>¡Hola, {user.username}!</h1>
      <p
        style={{
          color: 'var(--color-text-muted)',
          marginBottom: 'var(--space-md)',
        }}
      >
        Rol: {user.role_name}
      </p>

      {/* Guías de Onboarding Primero - Desaparecen si no hay pendientes */}
      <OnboardingGuideWidget user={user} onNavigate={onNavigate} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-md)',
        }}
      >
        {/* Lógica para el DUEÑO */}
        {user.role_name === 'DUEÑO' && (
          <>
            <SalesStatsWidget />
            <TopProductsWidget />
            <PurchasesListWidget />
            <BusinessAlertsWidget />
          </>
        )}

        {/* Lógica para el EMPLEADO */}
        {user.role_name === 'EMPLEADO' && (
          <>
            <EmployeeTasksWidget user={user} />
          </>
        )}
      </div>
    </div>
  );
}
