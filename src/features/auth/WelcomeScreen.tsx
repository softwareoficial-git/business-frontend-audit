import React, { useState } from 'react';
import { registerClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Building2, User, Lock, ArrowRight, Loader2 } from 'lucide-react';

const WelcomeScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);

  const [formData, setFormData] = useState({
    nombreCliente: '',
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!isLogin) {
        const response = await registerClient({
          client_name: formData.nombreCliente || 'Default Store',
          owner_email: `${formData.username}@example.com`,
          username: formData.username,
          password: formData.password,
          nombreCliente: formData.nombreCliente || 'Default Store',
        });

        if (response && response.success) {
          setSession({
            token: response.data?.user?.token || response.token,
            tenantId: String(response.data?.cliente?.id || response.clienteId),
            username: formData.username,
            role: 'admin',
            isAuthenticated: true,
          });
        } else {
          // Handle detailed validation errors from the API
          const errorMessage = response?.errors?.[0]?.message || response?.message || 'Error al registrar empresa';
          alert(errorMessage);
        }
      } else {
        alert('El login requiere un endpoint /login. Por favor, use el registro para acceder al sistema.');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      // Handle errors thrown by axios-retry or API client
      const errorMessage = error?.errors?.[0]?.message || error?.message || 'Error de autenticación';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-mac-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <Building2 className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-mac-text tracking-tight">
            {isLogin ? 'Bienvenido' : 'Crea tu Empresa'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                data-testid="input-company"
                name="nombreCliente"
                placeholder="Nombre de la Empresa"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-mac-accent"
                onChange={(e) => setFormData({ ...formData, nombreCliente: e.target.value })}
                required
              />
            </div>
          )}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              data-testid="input-username"
              name="username"
              placeholder="Usuario"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-mac-accent"
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              data-testid="input-password"
              name="password"
              type="password"
              placeholder="Contraseña"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-mac-accent"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <button
            data-testid="btn-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-mac-accent text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <> {isLogin ? 'Ingresar' : 'Registrar Empresa'} <ArrowRight className="w-5 h-5" /> </>
            )}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            data-testid="btn-toggle-auth"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-mac-accent font-medium hover:underline"
          >
            {isLogin ? '¿No tienes cuenta? Crea tu empresa aquí' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
