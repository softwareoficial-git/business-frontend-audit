import { useToastStore } from './store';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div data-testid="toast-container" className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full px-4">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          data-testid="toast-item"
          className={`p-3 rounded-2xl shadow-lg backdrop-blur-md border text-white text-sm font-medium animate-in slide-in-from-top-full duration-300 ${
            toast.type === 'success' ? 'bg-green-500/80 border-green-600' :
            toast.type === 'error' ? 'bg-red-500/80 border-red-600' :
            toast.type === 'warning' ? 'bg-yellow-500/80 border-yellow-600' :
            'bg-blue-500/80 border-blue-600'
          }`}
          onClick={() => removeToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};
