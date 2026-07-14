import React from 'react';

export const PanelContainer = ({ children, title, isLoading = false }: { children: React.ReactNode, title?: string, isLoading?: boolean }) => {
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
          <main className="animate-in fade-in zoom-in-95 duration-500">
            {children}
          </main>
        )}
      </div>
    </div>
  );
};
