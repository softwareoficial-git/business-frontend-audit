import { useState } from 'react';
import { useAuthStore } from './store/authStore';
import WelcomeScreen from './features/auth/WelcomeScreen';
import Layout from './components/Layout';
import StockView from './features/stock/StockView';
import SalesView from './features/sales/SalesView';
import StaffView from './features/staff/StaffView';
import ReportsView from './features/reports/ReportsView';

type View = 'stock' | 'sales' | 'staff' | 'reports';

const AppPanels = () => {
  const [currentView, setCurrentView] = useState<View>('stock');

  const renderView = () => {
    switch (currentView) {
      case 'stock': return <StockView />;
      case 'sales': return <SalesView />;
      case 'staff': return <StaffView />;
      case 'reports': return <ReportsView />;
      default: return <StockView />;
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

function App() {
  const { session } = useAuthStore();

  return (
    <div className="App">
      {!session.isAuthenticated ? <WelcomeScreen /> : <AppPanels />}
    </div>
  );
}

export default App;
