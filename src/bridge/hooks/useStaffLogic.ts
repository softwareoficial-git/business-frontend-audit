import { useState, useCallback } from 'react';
import { executeCmd } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../engine/toast/store';

export const useStaffLogic = () => {
  const { session } = useAuthStore();
  const { addToast } = useToastStore();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await executeCmd('staff.list', {}, session.tenantId || '');
      const employeesData = res?.data?.usuarios || res?.data || [];
      setEmployees(employeesData);
    } catch (err) {
      addToast({ message: 'Error al cargar el personal', type: 'error' });
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [session.tenantId, addToast]);

  const createEmployee = async (employee: any) => {
    try {
      const res = await executeCmd('staff.create', {
        username: employee.username,
        password: employee.password,
        nombre: employee.username, // Using username as name since it's not in the form
        role: employee.role_id === 1 ? 'DUEÑO' : 'EMPLEADO',
      }, session.tenantId || '');

      if (res && res.success) {
        addToast({ message: 'Usuario creado con éxito', type: 'success' });
        await fetchEmployees();
        return { success: true };
      } else {
        addToast({ message: res?.message || 'Error creando usuario', type: 'error' });
        return { success: false, message: res?.message };
      }
    } catch {
      addToast({ message: 'Error de conexión al crear usuario', type: 'error' });
      return { success: false };
    }
  };

  return {
    employees,
    loading,
    fetchEmployees,
    createEmployee,
  };
};
