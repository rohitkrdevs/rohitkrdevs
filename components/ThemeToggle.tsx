"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleToggle = () => {
		// add transition class BEFORE switching theme
		document.documentElement.classList.add("theme-transition");

		setTheme(theme === "dark" ? "light" : "dark");

		// remove after animation completes
		setTimeout(() => {
			document.documentElement.classList.remove("theme-transition");
		}, 1000);
	};

	if (!mounted) {
		return <div className="w-9 h-9" />;
	}

	return (
		<button
			onClick={handleToggle}
			className="p-2 rounded-lg border border-foreground/20 bg-background text-foreground transition">
			{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
		</button>
	);
}
