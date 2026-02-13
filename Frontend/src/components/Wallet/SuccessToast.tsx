import React, { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

type Props = {
  message: string;
  open: boolean;
  onClose: () => void;
  durationMs?: number;
};

export function SuccessToast({ message, open, onClose, durationMs = 2200 }: Props) {
  const [visible, setVisible] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    let closeTimer: ReturnType<typeof setTimeout>;
    let removeTimer: ReturnType<typeof setTimeout>;

    if (open) {
      setVisible(true);
      setClosing(false);

      closeTimer = setTimeout(() => {
        setClosing(true);
        removeTimer = setTimeout(() => {
          setVisible(false);
          onClose();
        }, 180);
      }, durationMs);
    } else if (visible) {
      setClosing(true);
      removeTimer = setTimeout(() => setVisible(false), 180);
    }

    return () => {
      clearTimeout(closeTimer);
      clearTimeout(removeTimer);
    };
  }, [open, durationMs, onClose, visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed z-[60] left-4 right-4 bottom-5 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[380px]"
      dir="rtl"
    >
      <div
        className={`rounded-2xl border border-white/10 overflow-hidden
          shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]
          transition-all duration-180 ease-out
          ${closing ? "opacity-0 translate-y-2 scale-[0.985]" : "opacity-100 translate-y-0 scale-100"}`}
        style={{
          background:
            "radial-gradient(700px 260px at 90% 0%, rgba(79,203,233,0.35) 0%, rgba(22,89,159,1) 55%, rgba(13,55,110,1) 100%)",
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <div className="flex-1 text-sm font-medium text-white">{message}</div>
          <button
            onClick={() => {
              setClosing(true);
              setTimeout(() => {
                setVisible(false);
                onClose();
              }, 180);
            }}
            className="rounded-xl p-2 bg-white/10 hover:bg-white/15 transition active:scale-[0.98]"
            aria-label="بستن"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
