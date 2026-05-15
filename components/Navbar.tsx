"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import ThemeToggle from "./ThemeToggle";
import {
	Home,
	User,
	Briefcase,
	Code2,
	FolderGit2,
	Mail,
	Award,
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

	// Scroll spy
	useEffect(() => {
		const handleScroll = () => {
			const scrollPosition = window.scrollY + window.innerHeight * 0.35;

			let currentSection = "#about";

			for (const link of links) {
				const section = document.getElementById(link.href.replace("#", ""));

				if (!section) continue;

				const sectionTop = section.offsetTop;
				const sectionHeight = section.offsetHeight;

				if (
					scrollPosition >= sectionTop &&
					scrollPosition < sectionTop + sectionHeight
				) {
					currentSection = link.href;
				}
			}

			setActive(currentSection);
		};

		window.addEventListener("scroll", handleScroll, {
			passive: true,
		});

		handleScroll();

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [links]);

	// shared styles
	const baseItem =
		"group relative nav-item flex items-center justify-center w-10 h-10 md:w-14 md:h-14 aspect-square rounded-full transition-all duration-300 ease-out";

	const activeItem = "bg-[var(--fg)] text-[var(--bg)] shadow-md scale-105";

	const inactiveItem = "hover:bg-foreground/10 hover:scale-110";

	return (
		<div className="fixed top-4 left-0 w-full z-50 flex justify-center px-8 pb-4">
			<nav
				ref={navRef}
				className="
				w-full sm:w-auto
				max-w-6xl
				flex items-center justify-center
				gap-1.5 sm:gap-3
				px-2 sm:px-4
				py-1.5 sm:py-3
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
				<div className="w-px h-6 sm:h-8 bg-(--fg)/60 mx-1.5 sm:mx-2" />

				{/* THEME TOGGLE */}
				<ThemeToggle />
			</nav>
		</div>
	);
}
