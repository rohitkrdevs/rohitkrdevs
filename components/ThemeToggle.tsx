"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

export default function ThemeToggle() {
	const { theme, resolvedTheme, setTheme } = useTheme();

	const mounted = useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);

	const handleToggle = () => {
		// 1. Inject the crossfade class right before changing the state
		document.documentElement.classList.add("theme-transition");

		// 2. Safely swap based on actual evaluated visibility
		const currentTheme = theme === "system" ? resolvedTheme : theme;
		setTheme(currentTheme === "dark" ? "light" : "dark");

		// 3. Clean up the transitions class after completion
		setTimeout(() => {
			document.documentElement.classList.remove("theme-transition");
		}, 1000);
	};

	if (!mounted) {
		return null; // Prevents layout pops during the hydration phase
	}

	return (
		<button
			onClick={handleToggle}
			aria-label="Toggle theme mode"
			className="
                fixed 
               	left-6 
				bottom-20
                z-50 
                p-3 
                rounded-xl 
                border 
                border-foreground/10 
                bg-background/80 
                backdrop-blur-md 
                text-foreground 
                shadow-lg 
                shadow-black/5 
                hover:bg-muted/80 
                hover:border-foreground/20 
                active:scale-95 
                transition-all 
                duration-200 
                select-none 
                touch-action-manipulation
            ">
			{resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
		</button>
	);
}
