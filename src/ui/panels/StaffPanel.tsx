import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, X, Save } from 'lucide-react';
import { useStaffLogic } from '../../bridge/hooks/useStaffLogic';
import { PanelContainer } from '../../engine/panels/PanelContainer';
import { useTranslate } from '../../engine/i18n/i18nStore';

const StaffPanel = () => {
  const t = useTranslate();
  const { employees, loading, fetchEmployees, createEmployee } = useStaffLogic();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', role_id: 2 });

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createEmployee(formData);
    if (res?.success) {
      setIsModalOpen(false);
      setFormData({ username: '', password: '', role_id: 2 });
    }
  };

  return (
    <PanelContainer title={t('staff.title')}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">Total personal: {employees.length}</div>
          <button
            data-testid="btn-add-staff"
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            <UserPlus className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(employees || []).map(emp => (
              <div key={emp.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-500 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{emp.username}</h3>
                    <p className="text-xs text-slate-400">Rol: {emp.role_id === 1 ? 'Admin' : 'Empleado'}</p>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full rounded-3xl shadow-2xl p-6 relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-400"><X className="w-6 h-6" /></button>
              <h2 className="text-xl font-bold mb-6">{t('staff.create')}</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <input required data-testid="modal-staff-user" placeholder="Usuario" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                <input type="password" required data-testid="modal-staff-pass" placeholder="Contraseña" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                <select data-testid="modal-staff-role" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.role_id} onChange={(e) => setFormData({ ...formData, role_id: parseInt(e.target.value) })}>
                  <option value={1}>{t('staff.role')} - Admin</option>
                  <option value={2}>{t('staff.role')} - Empleado</option>
                </select>
                <button type="submit" data-testid="btn-save-staff" className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all mt-4 shadow-lg shadow-blue-200">
                  <Save className="w-5 h-5" /> {t('staff.save')}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </PanelContainer>
  );
};

export default StaffPanel;
