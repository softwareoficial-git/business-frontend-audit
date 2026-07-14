import React, { useState, useEffect } from 'react';
import { registerClient, loginUser, checkUsernameExists } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../engine/toast/store';
import { Building2, User, Lock, ArrowRight, Loader2, CheckCircle, XCircle } from 'lucide-react';

const WelcomeScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);
  const addToast = useToastStore((state) => state.addToast);

  const [formData, setFormData] = useState({
    nombreCliente: '',
    username: '',
    password: '',
  });

  const [passwordValid, setPasswordValid] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [checkingUser, setCheckingUser] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!isLogin && formData.username.length >= 3) {
        setCheckingUser(true);
        const res = await checkUsernameExists(formData.username);
        setUserExists(res?.exists);
        setCheckingUser(false);
      } else {
        setUserExists(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.username, isLogin]);

  useEffect(() => {
    setPasswordValid(formData.password.length >= 6);
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!isLogin) {
        if (formData.password.length < 6) {
          addToast({ message: 'La contraseña debe tener al menos 6 caracteres', type: 'error' });
          setLoading(false);
          return;
        }

        const regResponse = await registerClient({
          client_name: formData.nombreCliente || 'Default Store',
          owner_email: `${formData.username}@example.com`,
          username: formData.username,
          password: formData.password,
          nombreCliente: formData.nombreCliente || 'Default Store',
        });

        if (regResponse && regResponse.success) {
          const userData = regResponse.data?.user;
          const clienteData = regResponse.data?.cliente;

          if (userData && userData.token) {
            setSession({
              token: userData.token,
              tenantId: String(clienteData?.id || userData.cliente_id),
              username: userData.username,
              role: 'admin',
              isAuthenticated: true,
            });
            addToast({ message: 'Empresa registrada con éxito', type: 'success' });
          } else {
            throw new Error('El servidor no devolvió un token de sesión tras el registro.');
          }
        } else {
          const errorMessage = regResponse?.message || 'Error al registrar empresa';
          addToast({ message: errorMessage, type: 'error' });
        }
      } else {
        const loginResponse = await loginUser({
          username: formData.username,
          password: formData.password,
        });

        if (loginResponse && loginResponse.success) {
          setSession({
            token: loginResponse.data?.user?.token || '',
            tenantId: String(loginResponse.data?.user?.clienteId),
            username: formData.username,
            role: loginResponse.data?.user?.role || 'admin',
            isAuthenticated: true,
          });
          addToast({ message: 'Bienvenido de nuevo', type: 'success' });
        } else {
          const errorMessage = loginResponse?.message || 'Credenciales incorrectas';
          addToast({ message: errorMessage, type: 'error' });
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error de autenticación';
      addToast({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="w-full grid md:grid-cols-2 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white overflow-hidden mx-auto">
        {/* Sección de Branding / Info (Solo visible en MD) */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-mac-accent text-white">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-8 shadow-xl">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Gestión Inteligente de tu Negocio</h2>
          <p className="text-blue-100 text-lg mb-8 leading-relaxed">
            Controla tu inventario, procesa ventas en segundos y analiza tus reportes en tiempo real con nuestra interfaz optimizada.
          </p>
          <div className="space-y-4">
            {[
              'Control de Stock en tiempo real',
              'Procesamiento de ventas rápido',
              'Análisis de métricas avanzado'
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-blue-50">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sección del Formulario */}
        <div className="p-6 lg:p-8 flex flex-col justify-center">
          <div className="text-center mb-6 lg:text-left">
            <div className="w-14 h-14 bg-mac-accent rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-3 shadow-lg shadow-blue-200">
              <Building2 className="text-white w-7 h-7" />
            </div>
            <h1 data-testid="welcome-title" className="text-2xl font-bold text-mac-text tracking-tight">
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
                className={`w-full pl-11 pr-11 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 transition-colors ${
                  userExists === true ? 'border-red-500 focus:ring-red-200' :
                  userExists === false ? 'border-green-500 focus:ring-green-200' :
                  'border-slate-200 focus:ring-mac-accent'
                }`}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checkingUser ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> :
                 userExists === true ? <XCircle className="w-4 h-4 text-red-500" /> :
                 userExists === false ? <CheckCircle className="w-4 h-4 text-green-500" /> : null}
              </div>
              {userExists === true && <p className="text-[10px] text-red-500 mt-1 ml-1">Este usuario ya existe</p>}
              {userExists === false && formData.username.length >= 3 && <p className="text-[10px] text-green-500 mt-1 ml-1">Usuario disponible</p>}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                data-testid="input-password"
                name="password"
                type="password"
                placeholder="Contraseña"
                className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 transition-colors ${
                  formData.password.length > 0 && !passwordValid ? 'border-red-500 focus:ring-red-200' :
                  passwordValid ? 'border-green-500 focus:ring-green-200' :
                  'border-slate-200 focus:ring-mac-accent'
                }`}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              {!passwordValid && formData.password.length > 0 && (
                <p className="text-[10px] text-red-500 mt-1 ml-1">La contraseña debe tener al menos 6 caracteres</p>
              )}
            </div>
            <button
              data-testid="btn-submit"
              type="submit"
              disabled={loading || (!isLogin && (userExists === true || !passwordValid))}
              className="w-full bg-mac-accent text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <> {isLogin ? 'Ingresar' : 'Registrar Empresa'} <ArrowRight className="w-5 h-5" /> </>
              )}
            </button>
          </form>
          <div className="mt-6 text-center lg:text-left">
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
    </div>
  );
};

export default WelcomeScreen;
