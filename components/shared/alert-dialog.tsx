'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

export function AlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Delete',
  cancelText = 'Cancel',
}: AlertDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Listen for Escape key to close dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle focus on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Trap focus while dialog is open
  useEffect(() => {
    if (!isOpen) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const cancelBtn = cancelButtonRef.current;
        const confirmBtn = confirmButtonRef.current;
        if (!cancelBtn || !confirmBtn) return;

        if (e.shiftKey) {
          if (document.activeElement === cancelBtn) {
            confirmBtn.focus();
            e.preventDefault();
          } else if (document.activeElement !== confirmBtn) {
            confirmBtn.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === confirmBtn) {
            cancelBtn.focus();
            e.preventDefault();
          } else if (document.activeElement !== cancelBtn) {
            cancelBtn.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleTabKey);
    return () => window.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#070b0c]/80 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.3 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            className="relative w-full max-w-md bg-nbac-panel border border-nbac-border rounded-xl p-6 shadow-2xl z-10 space-y-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-nbac-danger/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="text-nbac-danger" size={20} />
              </div>
              <div className="space-y-1.5">
                <h3 id="alert-dialog-title" className="font-sans font-bold text-lg text-white">
                  {title}
                </h3>
                <p id="alert-dialog-description" className="font-sans text-sm text-nbac-body font-light leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 font-sans text-sm">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-nbac-border text-nbac-body hover:bg-nbac-canvas hover:text-white rounded-full transition-colors cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                ref={confirmButtonRef}
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-5 py-2 bg-nbac-danger hover:bg-red-700 text-white font-medium rounded-full transition-colors cursor-pointer"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
