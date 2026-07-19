'use client';
import { useState, useEffect } from 'react';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { getCookie } from '../lib/cookies';
import { getProfile, logoutUser } from '../lib/auth';
import LoginPage from '../components/auth/LoginPage';
import RegisterPage from '../components/auth/RegisterPage';
import Dock from '../components/Dock';
import StockPanel from '../components/stock/StockPanel';

export default function WelcomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState<'home' | 'login' | 'register'>(
    'login'
  );
  const [currentView, setCurrentView] = useState<
    'home' | 'stock' | 'sales' | 'control'
  >('home');

  const checkAuth = async () => {
    setLoading(true);
    const token = getCookie('session_token');
    if (token) {
      const result = await getProfile();
      setIsAuthenticated(result.success);
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setIsAuthenticated(false);
    setAuthView('login');
  };

  if (loading)
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</main>
    );

  if (!isAuthenticated) {
    return authView === 'login' ? (
      <LoginPage onNavigate={setAuthView} onLoginSuccess={checkAuth} />
    ) : (
      <RegisterPage onNavigate={setAuthView} />
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'stock':
        return <StockPanel />;
      default:
        return (
          <div style={{ padding: '2rem' }}>
            <h1>¡BIENVENIDO!</h1>
            <p>Selecciona una opción en el Dock para empezar.</p>
          </div>
        );
    }
  };

  return (
    <main style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh' }}>
      {renderContent()}
      <Dock onLogout={handleLogout} onNavigate={setCurrentView} />
    </main>
  );
}
