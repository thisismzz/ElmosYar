import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

const sizeToClass: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
};

export function Modal({ open, title, subtitle, onClose, children, footer, size = "md" }: ModalProps) {
  const [render, setRender] = useState(open);
  const [closing, setClosing] = useState(false);

  const closeRequestedRef = useRef(false);

  // Mount/unmount lifecycle for exit animation
  useEffect(() => {
    if (open) {
      setRender(true);
      setClosing(false);
      closeRequestedRef.current = false;
      return;
    }

    // open -> false : play exit animation then unmount
    if (render) {
      setClosing(true);
      const t = window.setTimeout(() => {
        setRender(false);
        setClosing(false);
      }, 180); // match animation duration
      return () => window.clearTimeout(t);
    }
  }, [open, render]);

  // ESC handling + lock body scroll while mounted
  useEffect(() => {
    if (!render) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };

    document.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [render]);

  const requestClose = () => {
    if (closeRequestedRef.current) return;
    closeRequestedRef.current = true;
    onClose();
  };

  if (!render) return null;

  const backdropClass = closing
    ? "opacity-0"
    : "opacity-100";

  const panelClass = closing
    ? "opacity-0 translate-y-3 scale-[0.985]"
    : "opacity-100 translate-y-0 scale-100";

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        aria-label="بستن"
        className={[
          "absolute inset-0 bg-black/50 backdrop-blur-sm",
          "transition-opacity duration-180 ease-out",
          backdropClass,
        ].join(" ")}
        onClick={requestClose}
      />

      {/* Mobile-safe padding & bottom gutter */}
      <div className="relative w-full px-4 pt-4 pb-8 flex items-end sm:items-center justify-center">
        <div
          className={[
            "relative w-full",
            sizeToClass[size],
            "rounded-3xl overflow-hidden",
            "border border-white/10",
            "shadow-[0_30px_80px_-30px_rgba(0,0,0,0.65)]",
            "transition-all duration-180 ease-out",
            panelClass,
          ].join(" ")}
          style={{
            // hard cap height to avoid clipping under address bars / small screens
            maxHeight: "calc(100dvh - 2.5rem)",
          }}
          dir="rtl"
          role="dialog"
          aria-modal="true"
        >
          {/* Blue shell */}
          <div
            className="relative"
            style={{
              background:
                "radial-gradient(1200px 600px at 90% 0%, rgba(79,203,233,0.35) 0%, rgba(22,89,159,1) 45%, rgba(13,55,110,1) 100%)",
            }}
          >
            {/* Decorative sheen */}
            <div className="pointer-events-none absolute inset-0 opacity-50">
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-300/10 blur-2xl" />
            </div>

            {/* Header */}
            <div className="relative px-6 pt-6 pb-5 border-b border-white/10">
              <div className="flex items-start gap-0">
				<button
                  onClick={requestClose}
                  className="shrink-0 rounded-2xl p-2 bg-white/10 hover:bg-white/15 transition active:scale-[0.98]"
                  aria-label="بستن"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

				<div className="pl-10 flex-1 items-justify-center">
                <div className="min-w-0">
                  <h2 className="text-white text-base md:text-lg font-semibold leading-7">
                    {title}
                  </h2>
                  {subtitle ? (
					  <p className="mt-1 text-white/75 text-sm leading-6">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
				  </div>

                
              </div>
            </div>

            {/* Body (scrollable if needed) */}
            <div className="relative bg-white">
              <div
                className={[
                  "px-6 py-5",
                  "overflow-y-auto overscroll-contain",
                ].join(" ")}
                style={{
                  // header + footer take space; this makes body scroll when tall
                  maxHeight: footer ? "calc(100dvh - 2.5rem - 150px)" : "calc(100dvh - 2.5rem - 92px)",
                }}
              >
                {children}
              </div>

              {/* Footer Action Bar */}
              {footer ? (
                <div
                  className="flex px-6 py-4 border-t border-gray-100"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(22,89,159,0.08) 0%, rgba(79,203,233,0.10) 100%)",
                  }}
                >
                  <div className="flex items-center justify-end gap-2">
                    {footer}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const modalBtnPrimary =
  "rounded-xl px-4 py-2 text-white shadow-md transition active:scale-[0.98] " +
  "hover:shadow-lg hover:-translate-y-[1px] " +
  "bg-[#16599f] hover:bg-[#0f4f90]";

export const modalBtnGhost =
  "rounded-xl px-4 py-2 transition active:scale-[0.98] " +
  "bg-white hover:bg-gray-50 text-[#16599f] border border-[#16599f]/25 hover:border-[#16599f]/40";
