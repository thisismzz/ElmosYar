import React, { useEffect, useMemo, useRef, useState } from "react";

export type FilterFieldOption<V extends string> = {
	value: V;
	label: string; // Persian label
};

export type FilterField<K extends string, V extends string> = {
	key: K;
	label: string; // e.g. "روز"
	options: FilterFieldOption<V>[];
	placeholder?: string; // e.g. "همه"
};

export type FilterValues<K extends string, V extends string> = Partial<
	Record<K, V>
>;

type FilterButtonProps<K extends string, V extends string> = {
	label?: string; // e.g. "فیلتر"
	fields: FilterField<K, V>[];
	values: FilterValues<K, V>;
	onChange: (values: FilterValues<K, V>) => void;

	className?: string;
	disabled?: boolean;

	clearLabel?: string; // e.g. "پاک‌کردن"
	allLabel?: string; // e.g. "همه"
};

function useClickOutside(
	refs: React.RefObject<HTMLElement | null>[],
	onOutside: () => void,
	enabled: boolean
) {
	useEffect(() => {
		if (!enabled) return;

		const handler = (e: MouseEvent | TouchEvent) => {
			const target = e.target as Node | null;
			if (!target) return;
			const inside = refs.some((r) => r.current && r.current.contains(target));
			if (!inside) onOutside();
		};

		document.addEventListener("mousedown", handler);
		document.addEventListener("touchstart", handler);
		return () => {
			document.removeEventListener("mousedown", handler);
			document.removeEventListener("touchstart", handler);
		};
	}, [refs, onOutside, enabled]);
}

export function FilterButton<K extends string, V extends string>({
	label = "فیلتر",
	fields,
	values,
	onChange,
	className,
	disabled,
	clearLabel = "پاک‌کردن",
	allLabel = "همه",
}: FilterButtonProps<K, V>) {
	const [open, setOpen] = useState(false);
	const [activeFieldKey, setActiveFieldKey] = useState<K | null>(null);

	const btnRef = useRef<HTMLButtonElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	useClickOutside(
		[btnRef, menuRef],
		() => {
			setOpen(false);
			setActiveFieldKey(null);
		},
		open
	);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (!open) return;
			if (e.key === "Escape") {
				// if subpanel open, close only subpanel first
				if (activeFieldKey) setActiveFieldKey(null);
				else setOpen(false);
			}
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, activeFieldKey]);

	const appliedCount = useMemo(() => {
		return Object.values(values).filter(Boolean).length;
	}, [values]);

	const activeField = useMemo(() => {
		if (!activeFieldKey) return null;
		return fields.find((f) => f.key === activeFieldKey) ?? null;
	}, [activeFieldKey, fields]);

	const setValue = (key: K, v?: V) => {
		const next: FilterValues<K, V> = { ...values };
		if (!v) delete next[key];
		else next[key] = v;
		onChange(next);
	};

	const clearAll = () => {
		onChange({});
		setActiveFieldKey(null);
	};

	return (
		<div dir="rtl" className={`relative inline-block z-50 ${className ?? ""}`}>
			<button
				ref={btnRef}
				type="button"
				disabled={disabled}
				onClick={() => setOpen((v) => !v)}
				aria-haspopup="menu"
				aria-expanded={open}
				className={[
					"inline-flex items-center gap-2 rounded-full ",
					"bg-[#16519F] px-3 py-2 text-sm text-zinc-100",
					"hover:bg-blue-900/60 hover:border-zinc-700/70",
					"focus:outline-none focus:ring-2 focus:ring-zinc-600/40",
					"disabled:opacity-50 disabled:cursor-not-allowed",
					"transition-colors",
				].join(" ")}
			>
				<span className="text-zinc-200">{label}</span>
				{appliedCount > 0 ? (
					<span className="rounded-full bg-blue-200/10 px-2 py-0.5 text-xs text-zinc-200">
						{appliedCount}
					</span>
				) : (
					<span className="text-xs text-zinc-400">{allLabel}</span>
				)}
			</button>

			<div
				ref={menuRef}
				role="menu"
				aria-label={label}
				className={[
					"absolute z-50 mt-2 w-[min(90vw,22rem)] overflow-hidden rounded-2xl border border-zinc-800/70",
					"bg-blue-950/95 shadow-lg shadow-black/30 backdrop-blur",
					"origin-top-right transition-all duration-150",
					open
						? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
						: "scale-95 opacity-0 -translate-y-1 pointer-events-none",
				].join(" ")}
			>
				{/* Header */}
				<div className="flex items-center justify-between border-b border-zinc-800/70 px-3 py-2">
					<div className="text-sm text-zinc-200">
						{activeField ? activeField.label : "انتخاب فیلترها"}
					</div>
					<div className="flex items-center gap-2">
						{appliedCount > 0 && !activeField && (
							<button
								type="button"
								onClick={clearAll}
								className={[
									"rounded-full px-2 py-1 text-xs text-zinc-300",
									"hover:bg-blue-900/60 focus:outline-none focus:ring-2 focus:ring-zinc-600/40",
									"transition-colors",
								].join(" ")}
							>
								{clearLabel}
							</button>
						)}
						{ activeField &&
							<button
								type="button"
								onClick={() => {
									 setActiveFieldKey(null);
								}}
								className={[
									"rounded-full px-2 py-1 text-xs text-zinc-400",
									"hover:bg-blue-900/60 focus:outline-none focus:ring-2 focus:ring-zinc-600/40",
									"transition-colors",
								].join(" ")}
							>
								بازگشت
							</button>
						}
					</div>
				</div>

				{/* Body */}
				<div className="p-2">
					{!activeField && (
						<div className="grid gap-2">
							{fields.map((f) => {
								const chosen = values[f.key];
								const chosenLabel =
									f.options.find((o) => o.value === chosen)?.label ??
									f.placeholder ??
									allLabel;

								return (
									<button
										key={f.key}
										type="button"
										onClick={() => setActiveFieldKey(f.key)}
										className={[
											"flex w-full items-center justify-between rounded-xl border border-zinc-800/70",
											"bg-blue-950/30 px-3 py-2 text-sm",
											"hover:bg-blue-900/60 hover:border-zinc-700/70",
											"focus:outline-none focus:ring-2 focus:ring-zinc-600/40",
											"transition-colors",
										].join(" ")}
									>
										<span className="text-zinc-200">{f.label}</span>
										<span
											className={[
												"text-xs",
												chosen ? "text-zinc-200" : "text-zinc-500",
											].join(" ")}
										>
											{chosenLabel}
										</span>
									</button>
								);
							})}
						</div>
					)}

					{activeField && (
						<div
							className={[
								"grid gap-1",
								"animate-[fadeIn_150ms_ease-out]",
							].join(" ")}
						>
							{/* Clear current field */}
							<button
								type="button"
								onClick={() => setValue(activeField.key, undefined)}
								className={[
									"flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm",
									"text-zinc-300 hover:bg-blue-900/60",
									"focus:outline-none focus:ring-2 focus:ring-zinc-600/40",
									"transition-colors",
								].join(" ")}
							>
								<span>{activeField.placeholder ?? allLabel}</span>
								<span className="text-xs text-zinc-500">بدون محدودیت</span>
							</button>

							<div className="my-1 h-px bg-blue-800/70" />

							{activeField.options.map((opt) => {
								const active = values[activeField.key] === opt.value;
								return (
									<button
										key={opt.value}
										type="button"
										onClick={() => {
											setValue(activeField.key, opt.value);
											setActiveFieldKey(null);
										}}
										className={[
											"flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm",
											"text-zinc-100 hover:bg-blue-900/60",
											"focus:outline-none focus:ring-2 focus:ring-zinc-600/40",
											"transition-colors",
											active ? "bg-blue-900/70" : "",
										].join(" ")}
									>
										<span>{opt.label}</span>
										{active ? (
											<span className="text-xs text-zinc-400">انتخاب‌شده</span>
										) : (
											<span className="text-xs text-zinc-500"> </span>
										)}
									</button>
								);
							})}
						</div>
					)}
				</div>
			</div>

			{/* Keyframes for the tiny body fade (Tailwind arbitrary animate uses existing keyframes only if defined).
          If you don't have custom keyframes configured, remove the animate-[fadeIn...] class above.
          The component still animates open/close via scale/opacity on the container. */}
		</div>
	);
}
