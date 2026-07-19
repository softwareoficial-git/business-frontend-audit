'use client';
import { useState, useEffect } from 'react';
import Dock from '../components/Dock';
import StockPanel from '../components/stock/StockPanel';
import LoginPage from '../components/auth/LoginPage';
import RegisterPage from '../components/auth/RegisterPage';
import { getProfile, logoutUser } from '../lib/auth';

type View = 'home' | 'stock' | 'sales' | 'control' | 'login' | 'register';

export default function WelcomePage() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
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

  const handleNavigate = (view: 'home' | 'stock' | 'sales' | 'control') => {
    setCurrentView(view);
  };

  // Si sigue cargando, retornamos un elemento vacío o null para evitar renderizar el main
  if (loading) return null;

  if (!user) {
    if (currentView === 'register') {
      return <RegisterPage onNavigate={setCurrentView} />;
    }
    return <LoginPage onNavigate={setCurrentView} onLoginSuccess={checkAuth} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'stock':
        return <StockPanel />;
      case 'sales':
        return <div style={{ padding: '2rem' }}>Panel de Ventas</div>;
      case 'control':
        return <div style={{ padding: '2rem' }}>Panel de Control</div>;
      default:
        return (
          <div style={{ padding: '2rem' }}>
            <h1>¡BIENVENIDO, {user.username}!</h1>
            <p>Selecciona una opción en el Dock para empezar.</p>
          </div>
        );
    }
  };

  return (
    <main
      style={{
        padding: '2rem',
        textAlign: 'center',
        minHeight: '100vh',
        background: 'transparent',
      }}
    >
      {renderContent()}
      <Dock onLogout={handleLogout} onNavigate={handleNavigate} />
    </main>
  );
}
