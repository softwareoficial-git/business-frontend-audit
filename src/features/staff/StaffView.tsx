import React, { useState, useEffect, useCallback } from 'react';
import { executeCmd } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Users, UserPlus, Trash2, X, Save } from 'lucide-react';

interface Employee { id: number; username: string; role_id: number; }

const StaffView = () => {
  const { session } = useAuthStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', role_id: 2 });

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await executeCmd('system.users.list', {}, session.tenantId || '');
      const employeesData = res?.data?.results || [];
      setEmployees(employeesData);
    } catch (err) {
      console.error('Staff error:', err);
      setEmployees([]);
    }
    finally { setLoading(false); }
  }, [session.tenantId]);

  useEffect(() => {
    (async () => {
      await fetchEmployees();
    })();
  }, [fetchEmployees]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await executeCmd('system.users.create', {
        username: formData.username,
        password: formData.password,
        role: formData.role_id === 1 ? 'admin' : 'employee',
      }, session.tenantId || '');

      if (res && res.success) {
        setEmployees(prev => {
          const current = Array.isArray(prev) ? prev : [];
          return [...current, {
            id: Date.now(),
            username: formData.username,
            role_id: formData.role_id
          }];
        });
        setIsModalOpen(false);
        setFormData({ username: '', password: '', role_id: 2 });
      } else {
        alert(res?.message || 'Error creando usuario');
      }
      // Removed immediate fetchEmployees() to avoid UI flickering and race conditions
    } catch { alert('Error creando usuario'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-mac-text">👥 Gestión de Staff</h1>
        <button data-testid="btn-add-staff" onClick={() => setIsModalOpen(true)} className="bg-mac-accent text-white p-3 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-600 transition-all">
          <UserPlus className="w-6 h-6" />
        </button>
      </div>
      {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mac-accent"></div></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(employees || []).map(emp => (
            <div key={emp.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-mac-accent transition-all" data-testid={`employee-${emp.username}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"><Users className="w-5 h-5" /></div>
                <div><h3 className="font-semibold">{emp.username}</h3><p className="text-xs text-slate-400">Rol: {emp.role_id === 1 ? 'Admin' : 'Empleado'}</p></div>
              </div>
              <button className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))}
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full rounded-3xl shadow-2xl p-6 relative">

            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-400"><X className="w-6 h-6" /></button>
            <h2 className="text-xl font-bold mb-6">Nuevo Empleado</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input data-testid="modal-staff-user" required placeholder="Usuario" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-mac-accent" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
              <input data-testid="modal-staff-pass" type="password" required placeholder="Contraseña" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-mac-accent" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              <select data-testid="modal-staff-role" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-mac-accent" value={formData.role_id} onChange={(e) => setFormData({ ...formData, role_id: parseInt(e.target.value) })}><option value={1}>Administrador</option><option value={2}>Empleado</option></select>
              <button type="submit" className="w-full bg-mac-accent text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all mt-4 shadow-lg shadow-blue-200"><Save className="w-5 h-5" /> Crear Cuenta</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffView;
