"use client";

import * as React from "react";
import { ChevronDownIcon, CheckIcon } from "lucide-react";

import { twMerge } from "tailwind-merge";
import clsx from "clsx";


interface SelectContextValue {
	value: string | null;
	setValue: (v: string) => void;
	open: boolean;
	setOpen: (o: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue | null>(
	null,
);

function useSelect() {
	const ctx = React.useContext(SelectContext);
	if (!ctx) {
		throw new Error("Select components must be inside <Select>");
	}
	return ctx;
}


interface SelectProps {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	children: React.ReactNode;
}

export function Select({
	value: controlledValue,
	defaultValue,
	onValueChange,
	children,
}: SelectProps) {
	const [open, setOpen] = React.useState(false);
	const [uncontrolledValue, setUncontrolledValue] =
		React.useState(defaultValue ?? null);

	const value =
		controlledValue !== undefined
			? controlledValue
			: uncontrolledValue;

	const setValue = (v: string) => {
		onValueChange?.(v);
		setUncontrolledValue(v);
	};

	return (
		<SelectContext.Provider
			value={{ value, setValue, open, setOpen }}
		>
			<div className="relative">{children}</div>
		</SelectContext.Provider>
	);
}


export function SelectTrigger({
	className,
	children,
}: React.HTMLAttributes<HTMLButtonElement>) {
	const { open, setOpen } = useSelect();

	return (
		<button
			type="button"
			data-slot="select-trigger"
			onClick={() => setOpen(!open)}
			className={twMerge(clsx(
				"flex w-full items-center justify-between rounded-md border bg-input-background px-3 py-2 text-sm focus-visible:ring-[3px]",
				className,
			))}
		>
			{children}
			<ChevronDownIcon className="size-4 opacity-50" />
		</button>
	);
}


export function SelectValue({
	placeholder,
}: {
	placeholder?: string;
}) {
	const { value } = useSelect();

	return (
		<span
			data-slot="select-value"
			className={twMerge(clsx(
				!value && "text-muted-foreground",
			))}
		>
			{value ?? placeholder}
		</span>
	);
}


export function SelectContent({
	className,
	children,
}: React.HTMLAttributes<HTMLDivElement>) {
	const { open } = useSelect();

	if (!open) return null;

	return (
		<div
			data-slot="select-content"
			className={twMerge(clsx(
				"absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md",
				className,
			))}
		>
			{children}
		</div>
	);
}


interface SelectItemProps
	extends React.HTMLAttributes<HTMLDivElement> {
	value: string;
}

export function SelectItem({
	value,
	className,
	children,
}: SelectItemProps) {
	const { value: selected, setValue, setOpen } =
		useSelect();

	const isSelected = selected === value;

	return (
		<div
			data-slot="select-item"
			role="option"
			aria-selected={isSelected}
			onClick={() => {
				setValue(value);
				setOpen(false);
			}}
			className={twMerge(clsx(
				"relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm hover:bg-accent",
				isSelected && "bg-accent",
				className,
			))}
		>
			{children}
			{isSelected && (
				<span className="absolute right-2">
					<CheckIcon className="size-4" />
				</span>
			)}
		</div>
	);
}

export function SelectLabel({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			data-slot="select-label"
			className={twMerge(clsx(
				"px-2 py-1.5 text-xs text-muted-foreground",
				className,
			))}
			{...props}
		/>
	);
}

export function SelectSeparator({
	className,
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			data-slot="select-separator"
			className={twMerge(clsx(
				"my-1 h-px bg-border",
				className,
			))}
		/>
	);
}
