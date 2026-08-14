import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const VARIANTS = {
  success: { icon: CheckCircle2, ring: 'border-emerald-200', accent: 'text-emerald-600', bar: 'bg-emerald-500' },
  error: { icon: AlertCircle, ring: 'border-red-200', accent: 'text-red-600', bar: 'bg-red-500' },
  info: { icon: Info, ring: 'border-brand-200', accent: 'text-brand-600', bar: 'bg-brand-500' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, variant = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, variant }]);
    setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  const api = useMemo(() => ({
    success: (message) => push(message, 'success'),
    error: (message) => push(message, 'error'),
    info: (message) => push(message, 'info'),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-4 sm:top-4 sm:bottom-auto sm:items-end"
        role="region"
        aria-live="polite"
      >
        {toasts.map(({ id, message, variant }) => {
          const { icon: Icon, ring, accent, bar } = VARIANTS[variant] ?? VARIANTS.info;
          return (
            <div
              key={id}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border ${ring} bg-white p-3.5 shadow-overlay animate-slide-up`}
            >
              <span className={`absolute left-0 top-0 h-full w-1 ${bar}`} aria-hidden="true" />
              <Icon size={18} className={`mt-0.5 shrink-0 ${accent}`} aria-hidden="true" />
              <p className="flex-1 text-sm leading-snug text-ink-700">{message}</p>
              <button
                onClick={() => dismiss(id)}
                className="shrink-0 rounded-md p-0.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600"
                aria-label="Dismiss notification"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
