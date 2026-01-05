import React, { useEffect, useMemo, useRef, useState } from "react";
import { Download, Upload, Loader2, ChevronDown } from "lucide-react";

type DriveSyncStatus =
	| { kind: "idle"; text?: string }
	| { kind: "loading"; text?: string }
	| { kind: "saving"; text?: string }
	| { kind: "success"; text: string }
	| { kind: "error"; text: string };

type DriveSyncButtonProps = {
	onSave: () => Promise<void>;
	onLoad: () => Promise<void>;

	label?: string;
	status?: DriveSyncStatus;
	disabled?: boolean;
	className?: string;
};

export function DriveSyncButton({
	onSave,
	onLoad,
	label = "Drive",
	status: controlledStatus,
	disabled = false,
	className = "",
}: DriveSyncButtonProps) {
	const [open, setOpen] = useState(false);
	const [internalStatus, setInternalStatus] = useState<DriveSyncStatus>({
		kind: "idle",
		text: "Not synced",
	});

	const status = controlledStatus ?? internalStatus;

	const busy = status.kind === "loading" || status.kind === "saving";
	const pillDisabled = disabled || busy;

	const rootRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		function onDocMouseDown(e: MouseEvent) {
			if (!rootRef.current) return;
			if (!rootRef.current.contains(e.target as Node)) setOpen(false);
		}
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") setOpen(false);
		}
		document.addEventListener("mousedown", onDocMouseDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("mousedown", onDocMouseDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, []);

	useEffect(() => {
		if (controlledStatus) return;
		if (status.kind !== "success") return;

		const t = window.setTimeout(() => {
			setInternalStatus({ kind: "idle", text: "Synced" });
		}, 2500);

		return () => window.clearTimeout(t);
	}, [status.kind, controlledStatus]);

	const statusText = useMemo(() => {
		const fallback =
			status.kind === "idle"
				? "Not synced"
				: status.kind === "loading"
					? "Loading…"
					: status.kind === "saving"
						? "Saving…"
						: status.kind === "success"
							? "Synced"
							: "Error";
		return status.text ?? fallback;
	}, [status]);

	async function run(action: "save" | "load") {
		if (pillDisabled) return;

		setOpen(false);

		try {
			if (!controlledStatus) {
				setInternalStatus({
					kind: action === "save" ? "saving" : "loading",
					text: action === "save" ? "Saving…" : "Loading…",
				});
			}

			if (action === "save") await onSave();
			else await onLoad();

			if (!controlledStatus) {
				setInternalStatus({ kind: "success", text: "Synced" });
			}
		} catch (e: any) {
			if (!controlledStatus) {
				setInternalStatus({
					kind: "error",
					text: e?.message ? `Failed: ${e.message}` : "Failed",
				});
			}
		}
	}

	return (
		<div ref={rootRef} className={`relative inline-flex ${className}`}>
			{/* Preiew */}
			<button
				type="button"
				onClick={() => !pillDisabled && setOpen((v) => !v)}
				disabled={pillDisabled}
				className={[
					"group inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm",
					"bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/40",
					"shadow-sm transition-all duration-200",
					pillDisabled ? "opacity-60 cursor-not-allowed" : "hover:shadow-md",
					open ? "border-gray-300" : "border-gray-200",
					"focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-300",
				].join(" ")}
				aria-haspopup="menu"
				aria-expanded={open}
			>
				<GoogleDriveMark
					className={[
						"h-5 w-5",
						"transition-transform duration-200",
						busy ? "scale-[0.98]" : "group-hover:scale-[1.02]",
					].join(" ")}
				/>

				<div className="min-w-0 text-left">
					<div className="flex items-center gap-2">
						<span className="font-medium text-gray-900">{label}</span>
						{(status.kind === "loading" || status.kind === "saving") && (
							<Loader2 className="h-4 w-4 animate-spin text-gray-700" aria-hidden="true" />
						)}
					</div>
					<div
						className={[
							"truncate text-xs",
							status.kind === "error"
								? "text-red-600"
								: status.kind === "success"
									? "text-emerald-600"
									: "text-gray-600",
						].join(" ")}
						title={statusText}
					>
						{statusText}
					</div>
				</div>

				<ChevronDown
					className={[
						"ml-1 h-4 w-4 text-gray-700",
						"transition-transform duration-200",
						open ? "rotate-180" : "rotate-0",
					].join(" ")}
					aria-hidden="true"
				/>
			</button>

			{/* Dropdown */}
			<div
				className={[
					"absolute right-0 top-full z-50 mt-2 w-52 origin-top-right rounded-2xl border bg-white shadow-lg",
					"transition duration-200",
					open
						? "pointer-events-auto opacity-100 translate-y-0 scale-100"
						: "pointer-events-none opacity-0 -translate-y-1 scale-[0.98]",
				].join(" ")}
				role="menu"
				aria-label="Drive sync menu"
			>
				<div className="p-2">
					<MenuButton
						icon={<Download className="h-4 w-4" />}
						title="Load from Drive"
						subtitle="Replace local notes with Drive backup"
						onClick={() => run("load")}
						disabled={pillDisabled}
					/>
					<MenuButton
						icon={<Upload className="h-4 w-4" />}
						title="Save to Drive"
						subtitle="Upload current notes to Drive"
						onClick={() => run("save")}
						disabled={pillDisabled}
					/>
				</div>
			</div>
		</div>
	);
}

function MenuButton(props: {
	icon: React.ReactNode;
	title: string;
	subtitle: string;
	onClick: () => void;
	disabled?: boolean;
}) {
	return (
		<button
			type="button"
			role="menuitem"
			onClick={props.onClick}
			disabled={props.disabled}
			className={[
				"w-full rounded-xl px-3 py-2 text-left",
				"transition duration-200",
				props.disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-50 active:bg-gray-100",
				"focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300",
			].join(" ")}
		>
			<div className="flex items-start gap-3">
				<div className="mt-0.5 text-gray-700">{props.icon}</div>
				<div className="min-w-0">
					<div className="text-sm font-medium text-gray-900">{props.title}</div>
					<div className="text-xs text-gray-600">{props.subtitle}</div>
				</div>
			</div>
		</button>
	);
}

function GoogleDriveMark({ className = "" }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 64 64"
			fill="none"
			aria-hidden="true"
		>
			{/* left/green */}
			<path
				d="M20 10L6 34l10 17 14-24-10-17z"
				fill="#34A853"
			/>
			{/* Top/yellow */}
			<path
				d="M20 10h24l14 24H34L20 10z"
				fill="#FBBC05"
			/>
			{/* Right/blue */}
			<path
				d="M58 34L48 51H16l10-17h32z"
				fill="#4285F4"
			/>
		</svg>
	);
}
