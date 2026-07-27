'use client';

import { useState } from 'react';
import { apiClient } from '../../lib/api';

interface TasksEditorProps {
  employee: any;
  onUpdate: () => void;
}

export default function TasksEditor({ employee, onUpdate }: TasksEditorProps) {
  const [taskName, setTaskName] = useState('');
  const [taskDetails, setTaskDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const addTask = async () => {
    if (!taskName) return;
    setLoading(true);
    try {
      // Usaremos set_goal para persistir la tarea, aunque técnicamente
      // sería ideal crear un comando staff.assign_task en el futuro.
      // Por ahora, añadiremos la tarea al objeto de metas del empleado.
      await apiClient('/execute', {
        method: 'POST',
        body: JSON.stringify({
          cmd: 'staff.set_goal',
          params: {
            employeeId: employee.id,
            goalType: 'task',
            target: { task: taskName, details: taskDetails, status: 'pending' },
          },
        }),
      });
      setTaskName('');
      setTaskDetails('');
      onUpdate();
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 'var(--space-md)' }}>
      <h4>Tareas para {employee.name}</h4>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-sm)',
        }}
      >
        <input
          placeholder="Nombre de la tarea (ej: Prender luces)"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />
        <input
          placeholder="Detalles"
          value={taskDetails}
          onChange={(e) => setTaskDetails(e.target.value)}
        />
        <button onClick={addTask} disabled={loading}>
          {loading ? 'Asignando...' : 'Asignar Tarea'}
        </button>
      </div>

      <div style={{ marginTop: 'var(--space-md)' }}>
        <h5>Tareas Pendientes:</h5>
        {/* Aquí listaremos las tareas filtradas del empleado */}
      </div>
    </div>
  );
}
