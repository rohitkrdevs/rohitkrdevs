"use client";

import { useEffect, useState } from "react";

export default function GoToTopButton() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setVisible(window.scrollY > 300);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	if (!visible) return null;

	return (
		<button
			onClick={scrollToTop}
			aria-label="Go to top"
			className="
				fixed 
				right-6 
				bottom-20 /* This stacks it exactly 56px cleanly above the theme button */
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
			{/* Up Arrow SVG styled identically to match Lucide sizes natively */}
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				className="h-5 w-5" /* This exactly hits size={20} constraints */
			>
				<path d="M12 19V5" />
				<path d="M5 12l7-7 7 7" />
			</svg>
		</button>
	);
}
