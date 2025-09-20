import React, { createContext, useContext, useState, useCallback } from 'react';

interface Toast {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'error';
  ttl?: number;
}

interface ToastContextShape {
  push: (t: Omit<Toast,'id'>) => void;
}

const ToastContext = createContext<ToastContextShape | null>(null);

export const useToasts = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToasts must be used within ToastHost');
  return ctx;
};

interface ToastHostProps {
  children: React.ReactNode;
}

export const ToastHost: React.FC<ToastHostProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((toast: Omit<Toast,'id'>) => {
    const id = Math.random().toString(36);
    const fullToast: Toast = { ...toast, id };
    setToasts(prev => [...prev, fullToast]);

    const ttl = toast.ttl || 5000;
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, ttl);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {toasts.map(t => {
            const borderColor = t.type === 'success' ? 'border-green-200' :
                               t.type === 'error' ? 'border-red-200' :
                               'border-gray-200';
            const icon = t.type === 'success' ? '✅' :
                        t.type === 'error' ? '⚠️' :
                        'ℹ️';
            return (
              <div key={t.id} className={`px-4 py-3 rounded-lg shadow border text-sm flex items-start gap-2 bg-white ${borderColor}`}>
                <span>{icon}</span>
                <span className="flex-1 text-gray-700">{t.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
};