'use client';

import { useState, useEffect } from 'react';
import StockControlWidget from './StockControlWidget';
import SalesStatsWidget from './SalesStatsWidget';
import OnboardingGuideWidget from './OnboardingGuideWidget';
import EmployeeTasksWidget from './EmployeeTasksWidget';
import BusinessAlertsWidget from './BusinessAlertsWidget';
import KeyReportsWidget from './KeyReportsWidget';
import QuickActionsWidget from './QuickActionsWidget';

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
            <StockControlWidget />
            <KeyReportsWidget />
            <BusinessAlertsWidget />
            <QuickActionsWidget onNavigate={onNavigate} />
          </>
        )}

        {/* Lógica para el EMPLEADO */}
        {user.role_name === 'EMPLEADO' && (
          <>
            <EmployeeTasksWidget user={user} />
            <QuickActionsWidget onNavigate={onNavigate} />
          </>
        )}

        {/* Guías de Onboarding para todos (o según lógica de negocio) */}
        <OnboardingGuideWidget user={user} />
      </div>
    </div>
  );
}
