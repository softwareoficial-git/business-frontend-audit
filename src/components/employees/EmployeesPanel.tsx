'use client';

import { useState, useEffect } from 'react';
import './EmployeesPanel.css';
import { apiClient } from '../../lib/api';
import EmployeeActivityList from './EmployeeActivityList';
import PermissionsEditor from './PermissionsEditor';
import TasksEditor from './TasksEditor';
import EmployeeManager from './EmployeeManager';
import EmployeeProfileEditor from './EmployeeProfileEditor'; // Nuevo

export default function EmployeesPanel() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    'profile' | 'permissions' | 'goals' | 'sales'
  >('profile');
  const [isManagerOpen, setIsManagerOpen] = useState(false); // Estado para el panel de gestión

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({ cmd: 'staff.list', params: {} }),
      });
      const result = await response.json();
      const staffList = Array.isArray(result.data)
        ? result.data
        : result.data?.usuarios || [];
      setEmployees(staffList);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  };

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  return (
    <div className="employees-panel">
      {/* Sidebar: Listado de empleados */}
      <aside className="employees-sidebar">
        <h2>Personal</h2>
        <button
          onClick={() => setIsManagerOpen(true)}
          style={{
            marginBottom: 'var(--space-sm)',
            padding: 'var(--space-sm)',
          }}
        >
          + Agregar Empleado
        </button>
        <div className="sidebar-list">
          <button
            onClick={() => {
              setSelectedEmployeeId(null);
              setActiveTab('profile');
            }}
            className={`sidebar-item ${selectedEmployeeId === null ? 'active' : ''}`}
          >
            <span>Todo el personal</span>
          </button>
          {employees.map((emp) => (
            <button
              key={emp.id}
              onClick={() => {
                setSelectedEmployeeId(emp.id);
                setActiveTab('profile');
              }}
              className={`sidebar-item ${selectedEmployeeId === emp.id ? 'active' : ''}`}
            >
              <span style={{ fontWeight: 600 }}>
                {emp.name || emp.username}
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main: Detalle de empleado o Historial Global */}
      <main className="employees-main">
        {selectedEmployee ? (
          <div className="employee-detail">
            <h3>{selectedEmployee.name || selectedEmployee.username}</h3>

            {/* Sistema de pestañas */}
            <div className="tabs">
              {(['profile', 'permissions', 'goals', 'sales'] as const).map(
                (tab) => {
                  const tabNames = {
                    profile: 'Perfil',
                    permissions: 'Permisos',
                    goals: 'Tareas',
                    sales: 'Ventas',
                  };
                  return (
                    <button
                      key={tab}
                      className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tabNames[tab]}
                    </button>
                  );
                }
              )}
            </div>

            <div className="tab-content">
              {activeTab === 'profile' && (
                <EmployeeProfileEditor
                  employee={selectedEmployee}
                  onUpdate={fetchEmployees}
                />
              )}
              {activeTab === 'permissions' && (
                <PermissionsEditor
                  employee={selectedEmployee}
                  onUpdate={fetchEmployees}
                />
              )}
              {activeTab === 'goals' && (
                <TasksEditor
                  employee={selectedEmployee}
                  onUpdate={fetchEmployees}
                />
              )}
              {activeTab === 'sales' && (
                <EmployeeActivityList userId={selectedEmployeeId} />
              )}
            </div>
          </div>
        ) : (
          <div className="employee-detail">
            <h3>Actividad Reciente (Global)</h3>
            <EmployeeActivityList userId={undefined} />
          </div>
        )}

        {/* Modal/Panel para agregar empleado */}
        {isManagerOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10000,
            }}
            onClick={() => setIsManagerOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <EmployeeManager
                onUpdate={() => {
                  fetchEmployees();
                  setIsManagerOpen(false);
                }}
              />
            </div>
          </div>
        )}
      </main>

      {/* Tercera Columna: Actividad / Historial Global (Solo escritorio) */}
      <aside className="employees-activity">
        <h3>Actividad Reciente (Global)</h3>
        <EmployeeActivityList userId={undefined} />
      </aside>
    </div>
  );
}
