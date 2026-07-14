import { DOCK_CONFIG } from './config';
import { Icon } from '../icons/registry';

export const Dock = ({ activePanel, onPanelChange }: { activePanel: string, onPanelChange: (id: string) => void }) => {
  return (
    <div data-testid="main-dock" className="fixed bottom-2 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-full h-14 sm:h-16 bg-white/70 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl flex items-center justify-around px-2 sm:px-4 transition-all duration-300">
      {DOCK_CONFIG.map((item) => (
        <button
          key={item.id}
          data-testid={`nav-${item.id}`}
          onClick={() => onPanelChange(item.id)}
          className={`relative flex flex-col items-center justify-center transition-all duration-200 group ${
            activePanel === item.id ? 'scale-110' : 'scale-100 opacity-60 hover:opacity-100'
          }`}
        >
          <div className={`p-1.5 sm:p-2 rounded-full transition-colors ${
            activePanel === item.id ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 group-hover:bg-gray-100'
          }`}>
            <Icon name={item.icon} size={20} />
          </div>
          {activePanel === item.id && (
            <span className="absolute -top-7 text-[9px] sm:text-[10px] font-bold text-blue-600 uppercase tracking-wider animate-bounce">
              {item.label}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

