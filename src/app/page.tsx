'use client';
import { useState, useEffect, useRef } from 'react';
import Dock from '../components/Dock';
import ArcadeGame from '../components/game/ArcadeGame';
import StockPanel from '../components/stock/StockPanel';
import SalesPanel from '../components/sales/SalesPanel';
import EmployeesPanel from '../components/employees/EmployeesPanel';
import LoginPage from '../components/auth/LoginPage';
import RegisterPage from '../components/auth/RegisterPage';
import ProfilePanel from '../components/auth/ProfilePanel';
import HomePage from '../components/home/HomePage';
import { getProfile, logoutUser } from '../lib/auth';
import { useTour } from '../components/tour/TourProvider';
import { guides } from '../lib/guides';

type View =
  | 'home'
  | 'stock'
  | 'sales'
  | 'control'
  | 'employees'
  | 'game'
  | 'login'
  | 'register';

export default function WelcomePage() {
  const { startTour } = useTour();
  const [currentView, setCurrentView] = useState<View>('home');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const authChecked = useRef(false);

  useEffect(() => {
    if (user && !localStorage.getItem('tourSeen')) {
      startTour(guides.newUser);
      localStorage.setItem('tourSeen', 'true');
    }
  }, [user, startTour]);

  useEffect(() => {
    if (!authChecked.current) {
      checkAuth();
      authChecked.current = true;
    }

    // Escuchar evento de redirección
    const handleNavigateToSales = () => {
      handleNavigate('sales');
      // Pequeño delay para asegurar que el componente SalesPanel se monte
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('start_sales_tour'));
      }, 500);
    };
    window.addEventListener('navigate_to_sales', handleNavigateToSales);
    return () =>
      window.removeEventListener('navigate_to_sales', handleNavigateToSales);
  }, []);

  const checkAuth = async () => {
    const result = await getProfile();
    if (result.success) {
      setUser(result.profile);
      setCurrentView('home');
    } else {
      setUser(null);
      setCurrentView('login');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setCurrentView('login');
  };

  const handleNavigate = (view: View) => {
    if (
      user?.role_name !== 'DUEÑO' &&
      (view === 'control' || view === 'employees')
    ) {
      return;
    }
    setCurrentView(view);
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          backgroundColor: '#f5f7fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: '#666', fontFamily: 'sans-serif' }}>
          Cargando aplicación...
        </p>
      </main>
    );
  }

  if (!user) {
    if (currentView === 'register') {
      return (
        <RegisterPage onNavigate={setCurrentView} onLoginSuccess={checkAuth} />
      );
    }
    return <LoginPage onNavigate={setCurrentView} onLoginSuccess={checkAuth} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'stock':
        return <StockPanel />;
      case 'sales':
        return <SalesPanel />;
      case 'control':
        return user.role_name === 'DUEÑO' ? (
          <div style={{ padding: '2rem' }}>Panel de Control</div>
        ) : null;
      case 'employees':
        return user.role_name === 'DUEÑO' ? <EmployeesPanel /> : null;
      case 'game':
        return <ArcadeGame />;
      default:
        return <HomePage user={user} onNavigate={handleNavigate} />;
    }
  };

  return (
    <main
      style={{
        textAlign: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        paddingBottom: '70px', // Espacio ajustado para el Dock flotante
      }}
    >
      <div style={{ flex: 1, overflowY: 'auto' }}>{renderContent()}</div>
      {isProfileOpen && user && (
        <ProfilePanel user={user} onClose={() => setIsProfileOpen(false)} />
      )}
      <Dock
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        onOpenProfile={() => setIsProfileOpen(true)}
        role={user?.role_name || ''}
      />
    </main>
  );
}
