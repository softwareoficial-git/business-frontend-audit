import { useToastStore } from './store';
import { X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      data-testid="toast-container"
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-xs"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          data-testid="toast-item"
          className={`p-4 rounded-2xl shadow-2xl backdrop-blur-xl text-white text-sm font-semibold animate-in slide-in-from-right duration-300 flex items-start gap-3 transition-all ${
            toast.type === 'success' ? 'bg-green-600/50 shadow-green-500/20' :
            toast.type === 'error' ? 'bg-red-600/50 shadow-red-500/20' :
            toast.type === 'warning' ? 'bg-yellow-600/50 shadow-yellow-500/20' :
            'bg-blue-600/50 shadow-blue-500/20'
          }`}
        >
          <div className="flex-1 truncate pr-2 drop-shadow-md" title={toast.message}>
            {toast.message}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
            className="shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
