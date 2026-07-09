import React from 'react';
import { Package, ShoppingCart, Users, BarChart3, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

type View = 'stock' | 'sales' | 'staff' | 'reports';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  setCurrentView: (view: View) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setCurrentView }) => {
  const clearSession = useAuthStore((state) => state.clearSession);

  const navItems = [
    { id: 'stock', icon: Package, label: 'Stock' },
    { id: 'sales', icon: ShoppingCart, label: 'Ventas' },
    { id: 'staff', icon: Users, label: 'Staff' },
    { id: 'reports', icon: BarChart3, label: 'Reportes' },
  ];

  return (
    <div className="min-h-screen bg-mac-bg text-mac-text pb-24 font-sans">
      <main className="p-4 max-w-5xl mx-auto" data-testid="main-content">
        {children}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50" data-testid="mac-dock">
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl px-4 py-3 flex items-center justify-between">
          {navItems.map((item) => (
            <button
              key={item.id}
              data-testid={`nav-${item.id}`}
              onClick={() => setCurrentView(item.id as View)}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 ${
                currentView === item.id 
                  ? 'bg-mac-accent text-white shadow-lg shadow-blue-200 scale-110' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </button>
          ))}
          <div className="w-px h-8 bg-slate-200 mx-1" />
          <button 
            data-testid="nav-logout"
            onClick={clearSession}
            className="flex flex-col items-center justify-center p-2 rounded-2xl text-slate-400 hover:text-red-500 transition-all"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-[10px] font-medium mt-1">Salir</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
