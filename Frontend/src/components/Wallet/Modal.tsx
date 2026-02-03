// Modal.tsx - Responsive version using Tailwind
import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  footer: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  hideHeader?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({ 
  open, 
  onClose, 
  title, 
  subtitle, 
  footer, 
  size = 'md', 
  children,
  hideHeader = false 
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
      />

      {/* Container with safe spacing */}
      <div className="flex min-h-screen items-center justify-center p-4 pt-16 pb-24 text-center sm:p-0">
        {/* Modal Content */}
        <div className={`relative transform overflow-hidden rounded-lg bg-white text-right shadow-xl transition-all sm:my-8 w-full ${sizeClasses[size]} max-h-[85vh] sm:max-h-[90vh]`}>
          {/* Close button */}
          <button
            type="button"
            className="absolute left-4 top-4 rounded-md p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          {!hideHeader && (
            <div className="px-4 pt-5 pb-2 sm:p-6 sm:pb-4">
              {title && (
                <h3 className="text-lg font-medium text-gray-900">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Content - Scrollable with max height calculation */}
          <div className={`overflow-y-auto px-4 pt-0 pb-4 sm:p-6 sm:pb-4 ${
            hideHeader 
              ? 'max-h-[calc(85vh-8rem)] sm:max-h-[calc(90vh-8rem)]' 
              : 'max-h-[calc(85vh-12rem)] sm:max-h-[calc(90vh-12rem)]'
          }`}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const modalBtnGhost = "mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm";
export const modalBtnPrimary = "inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm";