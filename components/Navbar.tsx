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
import { motion } from "framer-motion";

export default function Navbar() {
	const [active, setActive] = useState("#about");
	const navRef = useRef<HTMLElement | null>(null);

	// Core Scroll Lock Engine Refs
	const isScrolling = useRef(false);
	const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
	const fallbackTimeout = useRef<NodeJS.Timeout | null>(null);
	const scrollListener = useRef<(() => void) | null>(null);

	const links = useMemo(
		() => [
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

	// 1. Premium Entrance Animation (Unchanged)
	useEffect(() => {
		if (!navRef.current) return;

		gsap.fromTo(
			navRef.current,
			{ y: -40, opacity: 0, scale: 0.95 },
			{
				y: 0,
				opacity: 1,
				scale: 1,
				duration: 1.2,
				ease: "elastic.out(1, 0.75)",
				delay: 0.1,
			},
		);
	}, []);

	// 2. High-Performance Intersection Observer
	useEffect(() => {
		const observerOptions = {
			root: null,
			rootMargin: "-30% 0px -70% 0px",
			threshold: 0,
		};

		const activeSections = new Map<string, boolean>();

		const observerCallback = (entries: IntersectionObserverEntry[]) => {
			// CRITICAL: Block all observer updates if smooth-scrolling is active
			if (isScrolling.current) return;

			entries.forEach((entry) => {
				activeSections.set(entry.target.id, entry.isIntersecting);
			});

			for (const link of links) {
				const id = link.href.replace("#", "");
				if (activeSections.get(id)) {
					setActive(link.href);
					return;
				}
			}

			if (
				window.innerHeight + window.scrollY >=
				document.documentElement.scrollHeight - 50
			) {
				setActive("#contact");
			}
		};

		const observer = new IntersectionObserver(
			observerCallback,
			observerOptions,
		);

		links.forEach((link) => {
			const el = document.getElementById(link.href.replace("#", ""));
			if (el) observer.observe(el);
		});

		return () => observer.disconnect();
	}, [links]);

	// Cleanup memory leaks on unmount
	useEffect(() => {
		return () => {
			if (scrollListener.current)
				window.removeEventListener("scroll", scrollListener.current);
			if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
			if (fallbackTimeout.current) clearTimeout(fallbackTimeout.current);
		};
	}, []);

	// 3. Production-Grade Smooth Scroll & State Lock Manager
	const handleNavClick = (
		e: React.MouseEvent<HTMLAnchorElement>,
		href: string,
	) => {
		e.preventDefault();

		const targetId = href.replace("#", "");
		const targetElement = document.getElementById(targetId);

		if (!targetElement) return;

		// 1. Immediately lock the scroll spy and set the target active state
		isScrolling.current = true;
		setActive(href);

		const offsetPosition =
			targetElement.getBoundingClientRect().top + window.scrollY - 100;

		// Optimization: If we are already at the exact target, unlock and return instantly
		if (Math.abs(window.scrollY - offsetPosition) < 2) {
			isScrolling.current = false;
			return;
		}

		// 2. Clean up any existing listeners from rapid consecutive clicks
		if (scrollListener.current)
			window.removeEventListener("scroll", scrollListener.current);
		if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
		if (fallbackTimeout.current) clearTimeout(fallbackTimeout.current);

		// 3. Dynamic Scroll-End Detection Strategy
		const handleScroll = () => {
			if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

			// If the scroll event stops firing for 100ms, physical scrolling has ended
			scrollTimeout.current = setTimeout(() => {
				isScrolling.current = false;
				if (scrollListener.current) {
					window.removeEventListener("scroll", scrollListener.current);
					scrollListener.current = null;
				}
			}, 100);
		};

		scrollListener.current = handleScroll;
		window.addEventListener("scroll", handleScroll, { passive: true });

		// 4. Absolute Fallback: Releases lock if scroll events fail/get interrupted
		fallbackTimeout.current = setTimeout(() => {
			isScrolling.current = false;
			if (scrollListener.current) {
				window.removeEventListener("scroll", scrollListener.current);
				scrollListener.current = null;
			}
		}, 2000);

		// 5. Trigger the actual browser native smooth scroll
		window.scrollTo({
			top: offsetPosition,
			behavior: "smooth",
		});
	};

	return (
		<div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
			<nav
				ref={navRef}
				role="navigation"
				aria-label="Main Navigation"
				className="
        pointer-events-auto
        relative
        flex items-center justify-center
        
        w-full max-w-(--container) sm:w-auto sm:max-w-fit
		mx-auto
		px-4 md:px-6
        
        p-1.5 sm:p-2 lg:p-2.5
        rounded-full
        
        /* UNIVERSAL GLASSMORPHISM EFFECTS */
        backdrop-blur-3xl saturate-200
        transition-colors duration-500

        bg-white/75
        border border-black/10
        shadow-[0_8px_32px_rgba(0,0,0,0.08)]
        
        dark:bg-[#0a0a0a]/65
        dark:border-white/15
        dark:shadow-[0_16px_48px_rgba(0,0,0,0.6)]
    ">
				<ul className="flex items-center justify-between sm:justify-center w-full gap-1 sm:gap-2 lg:gap-3 m-0 p-0 list-none">
					{links.map((item) => {
						const Icon = item.icon;
						const isActive = active === item.href;

						return (
							<li
								key={item.name}
								className="relative flex-1 sm:flex-initial flex justify-center">
								<a
									href={item.href}
									onClick={(e) => handleNavClick(e, item.href)}
									aria-current={isActive ? "page" : undefined}
									className={`
                                        group relative flex items-center justify-center 
                                        
                                        w-full aspect-square sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14
                                        max-w-14 sm:max-w-none
                                        
                                        rounded-full outline-none
                                        transition-colors duration-300 ease-out
                                        focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
                                        
                                        ${!isActive && "hover:bg-black/5 dark:hover:bg-white/10"}
                                    `}>
									{isActive && (
										<motion.div
											layoutId="active-nav-pill"
											transition={{
												type: "spring",
												stiffness: 380,
												damping: 30,
												mass: 0.8,
											}}
											className="
            absolute inset-0 rounded-full 
            
            /* LIGHT THEME: Dark background */
            bg-zinc-950 
            shadow-[0_2px_12px_rgba(0,0,0,0.12)] 
            
            /* DARK THEME: Light background */
            dark:bg-white 
            dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]
        "
										/>
									)}

									<span
										className={`
                                            relative z-10 transition-transform duration-300
                                            group-hover:scale-110 group-active:scale-95
                                            
                                            ${
																							isActive
																								? "text-white dark:text-zinc-950"
																								: "text-zinc-900 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-zinc-50"
																						}
                                        `}>
										<Icon
											className="h-4.5 w-4.5 md:h-5 md:w-5 lg:h-6 lg:w-6"
											strokeWidth={2}
										/>
									</span>

									<span
										className="
                                            absolute top-full mt-3 left-1/2 -translate-x-1/2 
                                            text-[11px] lg:text-xs font-semibold tracking-wide whitespace-nowrap
                                            opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0
                                            
                                            text-zinc-600 dark:text-zinc-300 
                                            bg-white/95 dark:bg-[#0a0a0a]/95 
                                            backdrop-blur-xl
                                            border border-black/5 dark:border-white/10
                                            shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)]
                                            
                                            px-3 lg:px-3.5 py-1.5 lg:py-2 rounded-lg
                                            pointer-events-none transition-all duration-300 ease-out
                                            z-50
                                        ">
										{item.name}
									</span>
								</a>
							</li>
						);
					})}
				</ul>
			</nav>
		</div>
	);
}
