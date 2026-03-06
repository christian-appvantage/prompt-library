'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <AlertCircle className="w-5 h-5" />,
  };

  const styles = {
    success: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600',
    info: 'bg-[#E60000] border-[#E60000]',
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 ${styles[type]} text-white px-4 py-3 rounded-xl shadow-2xl border-2 animate-scale-up min-w-[300px] max-w-md`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
