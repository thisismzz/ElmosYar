"use client";

import * as React from "react";
import { Toaster as Sonner, ToasterProps } from "sonner";

function getCurrentTheme(): ToasterProps["theme"] {
	if (typeof window === "undefined") return "system";

	if (document.documentElement.classList.contains("dark")) {
		return "dark";
	}

	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

export const Toaster = (props: ToasterProps) => {
	const [theme, setTheme] = React.useState<ToasterProps["theme"]>(
		getCurrentTheme()
	);

	React.useEffect(() => {
		const media = window.matchMedia("(prefers-color-scheme: dark)");

		const handler = () => {
			setTheme(getCurrentTheme());
		};

		media.addEventListener("change", handler);
		return () => media.removeEventListener("change", handler);
	}, []);

	return (
		<Sonner
			theme={theme}
			className="toaster group"
			style={
				{
					"--normal-bg": "var(--popover)",
					"--normal-text": "var(--popover-foreground)",
					"--normal-border": "var(--border)",
				} as React.CSSProperties
			}
			{...props}
		/>
	);
};
