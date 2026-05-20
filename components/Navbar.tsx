"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
	User,
	Briefcase,
	Code2,
	FolderGit2,
	Mail,
	Award,
	BookOpen,
} from "lucide-react";

import gsap from "gsap";

export default function Navbar() {
	const [active, setActive] = useState("#about");
	const navRef = useRef<HTMLDivElement | null>(null);

	const links = useMemo(
		() => [
			// { name: "Home", icon: Home, href: "#home" },
			{ name: "About", icon: User, href: "#about" },
			{ name: "Experience", icon: Briefcase, href: "#experience" },
			{ name: "Skills", icon: Code2, href: "#skills" },
			{ name: "Projects", icon: FolderGit2, href: "#projects" },
			{ name: "Certifications", icon: Award, href: "#certifications" },
			{ name: "Blogs", icon: BookOpen, href: "#blogs" },
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

	// Fixed Robust Scroll Spy using Viewport-Relative coordinates
	useEffect(() => {
		const handleScroll = () => {
			// We give it a comfortable offset (30% from the top of the viewport)
			const triggerLine = window.innerHeight * 0.3;
			let currentSection = "#about";

			// Loop backwards to catch the lowest active element on screen
			for (let i = links.length - 1; i >= 0; i--) {
				const link = links[i];
				const section = document.getElementById(link.href.replace("#", ""));

				if (!section) continue;

				const rect = section.getBoundingClientRect();

				// If the top of the section has crossed our trigger line, set it active and stop
				if (rect.top <= triggerLine) {
					currentSection = link.href;
					break;
				}
			}

			// Edge-case safety: If scrolled all the way to the bottom, force hit Contact
			if (
				window.innerHeight + window.scrollY >=
				document.documentElement.scrollHeight - 20
			) {
				currentSection = "#contact";
			}

			setActive(currentSection);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll(); // Initial run

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [links]);

	const baseItem =
		"group relative nav-item flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 aspect-square rounded-full transition-all duration-300 ease-out";

	const activeItem = "bg-[var(--fg)] text-[var(--bg)] shadow-md scale-105";
	const inactiveItem = "hover:bg-foreground/10 hover:scale-110";

	return (
		<div className="fixed top-4 left-0 w-full z-50 flex justify-center px-8 pb-4">
			<nav
				ref={navRef}
				className="
				w-auto
				max-w-fit
				flex
				items-center
				justify-center
				gap-2 sm:gap-3
				px-3 sm:px-4    {/* Increased padding for mobile buffer */}
				py-2 sm:py-3    {/* Increased vertical padding to match */}
				rounded-full
				backdrop-blur-xl
				border border-foreground/10
				bg-background/70
				text-foreground
				shadow-lg
				/* Removed overflow-hidden to allow subtle item shadows/scales to breathe */
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
							className={`${baseItem} ${isActive ? activeItem : inactiveItem} shrink-0`}
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
				{/* <div className="w-px h-6 sm:h-8 bg-(--fg)/60 mx-1.5 sm:mx-2" /> */}

				{/* THEME TOGGLE */}
				{/* <ThemeToggle /> */}
			</nav>
		</div>
	);
}
