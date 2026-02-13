// Modal.tsx
import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  hideHeader?: boolean;
}

const sizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  footer,
  size = "md",
  children,
  hideHeader = false,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 transition-opacity"
        onClick={onClose}
        style={{ backgroundColor: "var(--overlay-bg)" }}
      />

      {/* Centered container */}
      <div className="flex min-h-screen items-center justify-center p-4 pt-16 pb-24 text-center sm:p-0">
        {/* Modal */}
        <div
          className={`relative w-full transform overflow-hidden rounded-xl text-right shadow-xl transition-all sm:my-8 ${sizeClasses[size]} max-h-[85vh] sm:max-h-[90vh]`}
          style={{
            backgroundColor: "var(--background)",
            color: "var(--text-primary)",
          }}
        >
          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="absolute left-4 top-4 rounded-md p-1 focus:outline-none"
            style={{ color: "var(--text-light)" }}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          {!hideHeader && (
            <div className="px-4 pt-5 pb-2 sm:p-6 sm:pb-4">
              {title && (
                <h3
                  className="text-lg font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {title}
                </h3>
              )}

              {subtitle && (
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--text-light)" }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Content */}
          <div
            className={`overflow-y-auto px-4 pt-0 pb-4 sm:p-6 sm:pb-4 ${
              hideHeader
                ? "max-h-[calc(85vh-8rem)] sm:max-h-[calc(90vh-8rem)]"
                : "max-h-[calc(85vh-12rem)] sm:max-h-[calc(90vh-12rem)]"
            }`}
          >
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6"
              style={{
                backgroundColor: "var(--background-light)",
                borderTop: "1px solid var(--border-color)",
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Buttons                                                                    */
/* -------------------------------------------------------------------------- */

export const modalBtnGhost =
  "mt-3 inline-flex w-full justify-center rounded-md border px-4 py-2 text-base font-medium shadow-sm transition sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm";

export const modalBtnPrimary =
  "inline-flex w-full justify-center rounded-md px-4 py-2 text-base font-medium shadow-sm transition sm:ml-3 sm:w-auto sm:text-sm";
