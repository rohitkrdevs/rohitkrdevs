"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import ThemeToggle from "./ThemeToggle";
import { Home, User, Briefcase, Code2, FolderGit2, Mail } from "lucide-react";

import gsap from "gsap";

export default function Navbar() {
	const [active, setActive] = useState("#home");
	const navRef = useRef<HTMLDivElement | null>(null);

	const links = useMemo(
		() => [
			{ name: "Home", icon: Home, href: "#home" },
			{ name: "About", icon: User, href: "#about" },
			{ name: "Experience", icon: Briefcase, href: "#experience" },
			{ name: "Skills", icon: Code2, href: "#skills" },
			{ name: "Projects", icon: FolderGit2, href: "#projects" },
			{ name: "Contact", icon: Mail, href: "#contact" },
		],
		[],
	);

	// GSAP entrance animation
	useEffect(() => {
		if (!navRef.current) return;

		gsap.fromTo(
			navRef.current,
			{ y: -20, opacity: 0, scale: 0.96 },
			{ y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" },
		);
	}, []);

	// Scroll spy (stable)
	useEffect(() => {
		const sections = links
			.map((l) => document.getElementById(l.href.replace("#", "")))
			.filter(Boolean) as HTMLElement[];

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActive(`#${entry.target.id}`);
					}
				});
			},
			{
				threshold: 0.6,
				rootMargin: "-20% 0px -40% 0px",
			},
		);

		sections.forEach((sec) => observer.observe(sec));

		return () => observer.disconnect();
	}, [links]);

	// shared styles
	const baseItem =
		"group relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full transition-all duration-300 ease-out";

	const activeItem = "bg-[var(--fg)] text-[var(--bg)] scale-110 shadow-md";

	const inactiveItem = "hover:bg-foreground/10 hover:scale-110";

	return (
		<div className="fixed top-4 left-0 w-full z-50 flex justify-center px-4 pb-4">
			<nav
				ref={navRef}
				className="
				w-full sm:w-auto
				max-w-6xl
				flex items-center justify-center
				gap-2 sm:gap-3
				px-2 sm:px-4
				py-2 sm:py-3
				rounded-full
				backdrop-blur-xl
				border border-foreground/10
				bg-background/70
				text-foreground
				shadow-lg
				overflow-hidden
			">
				{/* MENU ITEMS */}
				{links.map((item) => {
					const Icon = item.icon;
					const isActive = active === item.href;

					return (
						<a
							key={item.name}
							href={item.href}
							onClick={() => setActive(item.href)}
							className={`${baseItem} ${isActive ? activeItem : inactiveItem}`}
							aria-label={item.name}>
							<Icon size={18} />

							{/* Tooltip (only inactive) */}
							{!isActive && (
								<span
									className="
									absolute -bottom-8 text-xs
									opacity-0 group-hover:opacity-100
									text-slate-600 dark:text-(--muted)
									transition
									pointer-events-none
								">
									{item.name}
								</span>
							)}

							{/* Active dot */}
							{isActive && (
								<span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-foreground" />
							)}
						</a>
					);
				})}

				{/* DIVIDER (FIXED VISIBILITY) */}
				<div className="w-px h-8 bg-(--fg)/60 mx-2" />

				{/* THEME TOGGLE */}
				<ThemeToggle />
			</nav>
		</div>
	);
}
