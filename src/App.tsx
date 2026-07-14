import { useState, useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import WelcomeScreen from './features/auth/WelcomeScreen';
import { Dock } from './engine/dock/Dock';
import { ToastContainer } from './engine/toast/ToastContainer';
import { ConnectionIndicator } from './engine/theme/ConnectionIndicator';
import { useConnectionStore } from './engine/theme/connectionStore';
import StockPanel from './ui/panels/StockPanel';
import SalesPanel from './ui/panels/SalesPanel';
import StaffPanel from './ui/panels/StaffPanel';
import ReportsPanel from './ui/panels/ReportsPanel';

const AppPanels = () => {
  const [activePanel, setActivePanel] = useState('stock');

  const renderView = () => {
    switch (activePanel) {
      case 'stock': return <StockPanel />;
      case 'sales': return <SalesPanel />;
      case 'staff': return <StaffPanel />;
      case 'reports': return <ReportsPanel />;
      default: return <StockPanel />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
      <ConnectionIndicator />
      <ToastContainer />
      <div className="w-full h-full">
        {renderView()}
      </div>
      <Dock activePanel={activePanel} onPanelChange={setActivePanel} />
    </div>
  );
};

function App() {
  const { session } = useAuthStore();
  const { checkConnection, syncOfflineQueue } = useConnectionStore();

  useEffect(() => {
    // Check inicial
    checkConnection();

    // Intervalo de monitoreo: verifica conexión y sincroniza cada 10 segundos
    const interval = setInterval(async () => {
      await checkConnection();
      await syncOfflineQueue();
    }, 10000);

    return () => clearInterval(interval);
  }, [checkConnection, syncOfflineQueue]);

  return (
    <div className="w-full min-h-screen">
      {!session.isAuthenticated ? <WelcomeScreen /> : <AppPanels />}
    </div>
  );
}

export default App;
