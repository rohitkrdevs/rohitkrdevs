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
				fixed bottom-6 right-6 z-50

				flex h-11 w-11 items-center justify-center

				rounded-xl

				border border-slate-200 bg-white
				text-slate-700 shadow-md

				transition-all duration-300

				hover:-translate-y-1 hover:shadow-lg

			">
			{/* Up Arrow Icon */}
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				className="h-5 w-5">
				<path d="M12 19V5" />
				<path d="M5 12l7-7 7 7" />
			</svg>
		</button>
	);
}
