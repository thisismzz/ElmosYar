import React, { useEffect, useMemo, useRef, useState } from "react";

type OptionId = string;

export type MenuOption = {
  id: OptionId;
  label: string; // Persian label preferred
  icon?: React.ReactNode; // optional (keep deps minimal; pass your own)
  disabled?: boolean;
};

type BaseMenuButtonProps = {
  label: string; // button label e.g. "فیلتر" / "مرتب‌سازی"
  options: MenuOption[];
  align?: "start" | "end";
  className?: string;
  buttonClassName?: string;
  dir?: "rtl" | "ltr";
};

type SingleSelectMenuButtonProps = BaseMenuButtonProps & {
  mode: "single";
  value?: OptionId;
  onChange: (next: OptionId | undefined) => void;
  clearText?: string; // e.g. "پاک کردن"
  placeholder?: string; // shown when no selection
};

type MultiSelectMenuButtonProps = BaseMenuButtonProps & {
  mode: "multi";
  value: OptionId[];
  onChange: (next: OptionId[]) => void;
  clearText?: string; // e.g. "حذف همه"
};

type MenuButtonProps = SingleSelectMenuButtonProps | MultiSelectMenuButtonProps;

function useOnClickOutside(
  refs: React.RefObject<HTMLElement>[],
  handler: () => void,
  enabled: boolean
) {
  useEffect(() => {
    if (!enabled) return;

    const onDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      const clickedInside = refs.some((r) => r.current?.contains(target));
      if (!clickedInside) handler();
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [refs, handler, enabled]);
}

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function badgeText(count: number) {
  if (count <= 0) return "";
  return count > 99 ? "۹۹+" : String(count).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

export function MenuButton(props: MenuButtonProps) {
  const {
    label,
    options,
    align = "start",
    className,
    buttonClassName,
    dir = "rtl",
  } = props;

  const buttonRef = useRef<HTMLButtonElement>();
  const panelRef = useRef<HTMLDivElement>();

  const [open, setOpen] = useState(false);

  useOnClickOutside([buttonRef ?? , panelRef], () => setOpen(false), open);

  const selectedLabel = useMemo(() => {
    if (props.mode === "single") {
      const sel = options.find((o) => o.id === props.value);
      return sel?.label ?? props.placeholder ?? "";
    }
    return "";
  }, [props, options]);

  const selectedCount = useMemo(() => {
    if (props.mode === "multi") return props.value.length;
    return props.value ? 1 : 0;
  }, [props]);

  const toggle = () => setOpen((v) => !v);

  const clear = () => {
    if (props.mode === "single") props.onChange(undefined);
    else props.onChange([]);
  };

  const onSelect = (id: OptionId) => {
    if (props.mode === "single") {
      props.onChange(id);
      setOpen(false);
      buttonRef.current?.focus();
    } else {
      const exists = props.value.includes(id);
      const next = exists ? props.value.filter((x) => x !== id) : [...props.value, id];
      props.onChange(next);
    }
  };

  return (
    <div dir={dir} className={cn("relative inline-flex", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm",
          "text-zinc-800 shadow-sm hover:bg-zinc-50 active:bg-zinc-100",
          "focus:outline-none focus:ring-2 focus:ring-zinc-300",
          buttonClassName
        )}
      >
        <span className="font-medium">{label}</span>

        {/* single-select preview */}
        {props.mode === "single" && selectedLabel ? (
          <span className="max-w-[14rem] truncate text-zinc-600 hidden sm:inline">
            {selectedLabel}
          </span>
        ) : null}

        {/* selection count badge */}
        {selectedCount > 0 ? (
          <span className="inline-flex min-w-6 justify-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
            {badgeText(selectedCount)}
          </span>
        ) : null}

        <span className="text-zinc-500">▾</span>
      </button>

      {open ? (
        <div
          ref={panelRef}
          role="menu"
          className={cn(
            "absolute z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg",
            align === "start" ? "right-0" : "left-0"
          )}
        >
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-zinc-100">
            <div className="text-sm font-semibold text-zinc-800">{label}</div>
            <button
              type="button"
              onClick={clear}
              className="text-xs text-zinc-600 hover:text-zinc-900"
            >
              {props.clearText ?? "پاک کردن"}
            </button>
          </div>

          <div className="max-h-72 overflow-auto py-1">
            {options.map((opt) => {
              const checked =
                props.mode === "single"
                  ? props.value === opt.id
                  : props.value.includes(opt.id);

              return (
                <button
                  key={opt.id}
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={checked}
                  disabled={opt.disabled}
                  onClick={() => onSelect(opt.id)}
                  className={cn(
                    "w-full px-3 py-2 text-right flex items-center gap-2",
                    "hover:bg-zinc-50 active:bg-zinc-100",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <span
                    className={cn(
                      "h-4 w-4 rounded border flex items-center justify-center",
                      checked ? "bg-zinc-900 border-zinc-900" : "border-zinc-300"
                    )}
                    aria-hidden="true"
                  >
                    {checked ? <span className="text-white text-[10px]">✓</span> : null}
                  </span>

                  {opt.icon ? <span className="text-zinc-500">{opt.icon}</span> : null}

                  <span className="flex-1 text-sm text-zinc-800">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Convenience wrappers */
export function SortButton(
  props: Omit<SingleSelectMenuButtonProps, "mode" | "label"> & { label?: string }
) {
  return (
    <MenuButton
      mode="single"
      label={props.label ?? "مرتب‌سازی"}
      {...props}
      clearText={props.clearText ?? "بازنشانی"}
      placeholder={props.placeholder ?? "انتخاب کنید"}
    />
  );
}

export function FilterButton(
  props: Omit<MultiSelectMenuButtonProps, "mode" | "label"> & { label?: string }
) {
  return (
    <MenuButton
      mode="multi"
      label={props.label ?? "فیلتر"}
      {...props}
      clearText={props.clearText ?? "حذف همه"}
    />
  );
}
