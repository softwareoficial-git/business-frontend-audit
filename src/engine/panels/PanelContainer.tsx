import React, { Component, ErrorInfo, ReactNode } from 'react';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error('ErrorBoundary caught error:', error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="bg-red-100 text-red-600 p-4 rounded-2xl mb-4">⚠️ Error al cargar el panel</div>
          <button onClick={() => window.location.reload()} className="text-blue-600 underline">Recargar página</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const PanelContainer = ({ children, title, isLoading = false }: { children: ReactNode, title?: string, isLoading?: boolean }) => {
  return (
    <div className="min-h-screen w-full mx-auto px-4 md:px-8 lg:px-12 pt-4 pb-16 transition-all duration-300">
      {title && (
        <header className="mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 data-testid="panel-title" className="text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
          <p className="text-gray-500 text-xs">Gestiona tu negocio con eficiencia.</p>
        </header>
      )}

      <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <ErrorBoundary>
            <main className="animate-in fade-in zoom-in-95 duration-500">
              {children}
            </main>
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
};
