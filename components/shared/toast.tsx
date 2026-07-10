'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, Info, Trash2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'delete';

export interface ToastOptions {
  description?: string;
  image?: string;
  duration?: number;
}

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  description?: string;
  image?: string;
  duration: number;
}

interface ToastContextType {
  toast: (message: string, options?: ToastOptions & { type?: ToastType }) => void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  delete: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, options?: ToastOptions & { type?: ToastType }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const type = options?.type || 'info';
      const duration = options?.duration || 4000;
      const description = options?.description;
      const image = options?.image;

      setToasts((prev) => [
        ...prev,
        { id, message, type, description, image, duration },
      ]);
    },
    []
  );

  const toastApi = useMemo(() => ({
    toast: (message: string, options?: ToastOptions & { type?: ToastType }) => addToast(message, options),
    success: (message: string, options?: ToastOptions) => addToast(message, { ...options, type: 'success' }),
    error: (message: string, options?: ToastOptions) => addToast(message, { ...options, type: 'error' }),
    info: (message: string, options?: ToastOptions) => addToast(message, { ...options, type: 'info' }),
    delete: (message: string, options?: ToastOptions) => addToast(message, { ...options, type: 'delete' }),
  }), [addToast]);

  return (
    <ToastContext.Provider value={toastApi}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  const { id, message, type, description, image, duration } = toast;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  // Icons based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="text-nbac-emerald shrink-0" size={18} />;
      case 'error':
        return <AlertTriangle className="text-nbac-danger shrink-0" size={18} />;
      case 'delete':
        return <Trash2 className="text-nbac-danger shrink-0" size={18} />;
      case 'info':
      default:
        return <Info className="text-nbac-gold shrink-0" size={18} />;
    }
  };

  // Border colors based on type
  const getBorderClass = () => {
    switch (type) {
      case 'success':
        return 'border-nbac-emerald/30 focus-within:border-nbac-emerald/50';
      case 'error':
        return 'border-nbac-danger/30 focus-within:border-nbac-danger/50';
      case 'delete':
        return 'border-nbac-danger/30 focus-within:border-nbac-danger/50';
      case 'info':
      default:
        return 'border-nbac-gold/30 focus-within:border-nbac-gold/50';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95, transition: { duration: 0.2 } }}
      className={`pointer-events-auto relative overflow-hidden bg-[#070b0c]/90 backdrop-blur-md border ${getBorderClass()} rounded-xl p-4 shadow-2xl flex items-start gap-3 w-full font-sans`}
    >
      {/* Icon or Thumbnail */}
      {image ? (
        <div className="relative w-10 h-10 rounded-md overflow-hidden bg-[#070b0c] border border-nbac-border shrink-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Thumbnail" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-nbac-canvas border border-nbac-border flex items-center justify-center shrink-0">
          {getIcon()}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 pr-4">
        <h4 className="text-xs font-bold text-white tracking-wide truncate">
          {message}
        </h4>
        {description && (
          <p className="text-[10px] text-nbac-muted leading-relaxed mt-0.5 break-words max-w-[280px]">
            {description}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onRemove(id)}
        className="text-nbac-muted hover:text-white transition-colors cursor-pointer shrink-0 absolute top-3 right-3"
      >
        <X size={14} />
      </button>

      {/* Premium countdown progress bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-[2px] ${
          type === 'success' ? 'bg-nbac-emerald' : type === 'error' || type === 'delete' ? 'bg-nbac-danger' : 'bg-nbac-gold'
        }`}
      />
    </motion.div>
  );
}
