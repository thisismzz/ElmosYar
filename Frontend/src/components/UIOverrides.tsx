import React from "react";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Light theme + dark blue accent
 * Accent: #16519F
 * Accent hover: #0d3a73
 */
const ACCENT = {
  bg: "bg-[#16519F]",
  bgHover: "hover:bg-[#0d3a73]",
  ring: "focus:ring-[#16519F]/15",
  borderFocus: "focus:border-[#16519F]/35",
  text: "text-[#16519F]",
};

export function PageShell(props: {
  title: string;
  description?: string;
  children: React.ReactNode;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-neutral-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="mb-6 grid grid-cols-3 items-start gap-4">
  <div className="min-w-0" /> {/* left spacer (or put left controls here later) */}

  <div className="min-w-0 text-center">
    <h1 className="text-lg font-semibold tracking-tight text-neutral-900">{props.title}</h1>
    {props.description ? (
      <p className="mt-1 text-sm text-neutral-600">{props.description}</p>
    ) : null}
  </div>

  <div className="flex justify-end">{props.rightSlot}</div>
</div>


        {props.children}
      </div>
    </div>
  );
}

export function Card(props: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200 bg-white shadow-sm",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}

export function CardHeader(props: { title: string; subtitle?: string; className?: string }) {
  return (
    <div className={cn("border-b border-neutral-200 px-5 py-4", props.className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-neutral-900">{props.title}</h2>
      </div>
      {props.subtitle ? <p className="mt-1 text-sm text-neutral-600">{props.subtitle}</p> : null}
    </div>
  );
}

export function CardBody(props: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-5 py-5", props.className)}>{props.children}</div>;
}

export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={cn("mb-1 block text-sm font-medium text-neutral-800", props.className)}
    />
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input(props, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900",
          "placeholder:text-neutral-400",
          "outline-none transition",
          "focus:ring-4",
          ACCENT.borderFocus,
          ACCENT.ring,
          "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-70",
          props.className
        )}
      />
    );
  }
);

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea(props, ref) {
  return (
    <textarea
      ref={ref}
      {...props}
      className={cn(
        "min-h-[120px] w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900",
        "placeholder:text-neutral-400",
        "outline-none transition",
        "focus:ring-4",
        ACCENT.borderFocus,
        ACCENT.ring,
        "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-70",
        props.className
      )}
    />
  );
});

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900",
        "outline-none transition",
        "focus:ring-4",
        ACCENT.borderFocus,
        ACCENT.ring,
        "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-70",
        props.className
      )}
    />
  );
}

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "ghost" | "danger";
  }
) {
  const variant = props.variant ?? "primary";

  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium",
        "transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60",
        "focus:outline-none focus:ring-4",
        variant === "primary" &&
          cn(
            ACCENT.bg,
            ACCENT.bgHover,
            "text-white shadow-sm",
            "focus:ring-[#16519F]/20"
          ),
        variant === "ghost" &&
          cn(
            "border border-neutral-200 bg-white text-neutral-900",
            "hover:bg-neutral-50",
            "focus:ring-neutral-200"
          ),
        variant === "danger" &&
          cn(
            "border border-red-200 bg-red-50 text-red-700",
            "hover:bg-red-100",
            "focus:ring-red-200"
          ),
        props.className
      )}
    />
  );
}

export function SegmentedControl<T extends string>(props: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string; hint?: string }>;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-1">
        {props.options.map((opt) => {
          const active = opt.value === props.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => props.onChange(opt.value)}
              className={cn(
                "relative flex-1 rounded-xl px-3 py-2 text-sm transition",
                "focus:outline-none focus:ring-4",
                active
                  ? cn("text-white shadow-sm", ACCENT.bg, "focus:ring-[#16519F]/20")
                  : cn("text-neutral-700 hover:bg-white", "focus:ring-neutral-200")
              )}
            >
              <span className="font-semibold">{opt.label}</span>
            </button>
          );
        })}
      </div>

      <div className="text-sm text-neutral-600">
        {props.options.find((x) => x.value === props.value)?.hint ?? ""}
      </div>
    </div>
  );
}

export function InlineError(props: { children?: React.ReactNode }) {
  if (!props.children) return null;
  return <div className="mt-2 text-sm text-red-600">{props.children}</div>;
}

export function HelperText(props: { children?: React.ReactNode; className?: string }) {
  if (!props.children) return null;
  return <div className={cn("mt-2 text-xs text-neutral-500", props.className)}>{props.children}</div>;
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-neutral-300 border-t-[#16519F]`}
      />
    </div>
  );
}