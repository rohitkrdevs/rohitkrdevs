"use client";

import { motion } from "framer-motion";

const skills = [
	"Next.js",
	"React",
	"TypeScript",
	"Tailwind CSS",
	"JavaScript (ES6+)",
	"Node.js",
	"Express.js",
	"PHP",
	"MySQL",
	"MongoDB",
	"WordPress",
	"REST APIs",
	"Git & GitHub",
	"Responsive Design",
	"SEO Optimization",
];

const stats = [
	{ value: "5+", label: "Years Experience" },
	{ value: "50+", label: "Projects Completed" },
	{ value: "30+", label: "Happy Clients" },
];

export default function About() {
	return (
		<section className="relative overflow-hidden mb-20">
			<div className="container">
				<div
					className="
						grid
						items-stretch
						gap-8
						lg:grid-cols-[380px_minmax(0,1fr)]
						lg:gap-12
					">
					{/* LEFT SIDEBAR */}
					<motion.aside
						initial={{ opacity: 0, x: -30 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className="h-full lg:sticky lg:top-28">
						<div
							className="
								glass
								flex
								h-full
								flex-col
								justify-between
								overflow-hidden
								p-6
								md:p-7
							">
							<div>
								{/* Avatar */}
								<div
									className="
									flex
									h-24
									w-24
									items-center
									justify-center
									rounded-3xl
									bg-linear-to-br
									from-blue-500/20
									to-blue-400/5
									border
									border-white/10
									text-3xl
									font-bold
								">
									RK
								</div>

								{/* Intro */}
								<div className="mt-6">
									<p className="text-xs uppercase tracking-[0.25em] text-(--muted)">
										Profile
									</p>

									<h3 className="mt-3 text-3xl font-bold">Rohit Kumar</h3>

									<p className="mt-2 text-sm leading-7 text-(--muted)">
										Full Stack Developer based in Ranchi, building scalable and
										visually polished web applications.
									</p>
								</div>

								{/* Stats */}
								<div className="mt-8 grid grid-cols-3 gap-3">
									{stats.map((item) => (
										<div
											key={item.label}
											className="
											card
												rounded-2xl
												border
												border-white/10
												bg-white/3
												p-4
												text-center
											">
											<h4 className="text-2xl font-bold">{item.value}</h4>

											<p className="mt-1 text-[11px] leading-tight text-(--muted)">
												{item.label}
											</p>
										</div>
									))}
								</div>

								{/* Skills */}
								<div className="mt-8">
									<p className="mb-3 text-xs uppercase tracking-[0.2em] text-(--muted)">
										Tech Stack
									</p>

									<div className="flex flex-wrap gap-2">
										{skills.map((skill) => (
											<span
												key={skill}
												className="
													rounded-full

													border border-transparent

													bg-white/90
													dark:bg-white/4

													px-3.5
													py-2

													text-[12px]
													font-medium

													text-slate-700
													dark:text-(--fg)

													backdrop-blur-xl

													shadow-[0_2px_10px_rgba(15,23,42,0.05),0_1px_3px_rgba(15,23,42,0.03)]

													transition-all
													duration-300

													hover:-translate-y-0.5
													hover:shadow-[0_8px_20px_rgba(15,23,42,0.08),0_2px_6px_rgba(15,23,42,0.05)]
													dark:hover:bg-white/6
												">
												{skill}
											</span>
										))}
									</div>
								</div>
							</div>

							{/* SOCIAL ICONS */}
							<div className="mt-8">
								<p className="mb-3 text-xs uppercase tracking-[0.2em] text-(--muted)">
									Connect
								</p>

								<div className="flex gap-3">
									{/* LinkedIn */}
									<a
										href="https://linkedin.com/in/rohitkrdevs"
										target="_blank"
										rel="noopener noreferrer"
										className="group flex h-11 w-11 items-center justify-center rounded-xl
										border border-slate-200 bg-white
										text-slate-700
										shadow-sm

										transition-all duration-300
										hover:-translate-y-1 hover:shadow-md hover:border-slate-300

										dark:border-white/10 dark:bg-white/5 dark:text-(--fg)
										dark:hover:bg-white/10 dark:hover:shadow-none">
										<svg
											viewBox="0 0 24 24"
											fill="currentColor"
											className="h-4.5 w-4.5 transition group-hover:scale-110">
											<path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.64-1.86 3.37-1.86 3.6 0 4.27 2.37 4.27 5.46v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.78C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.78 24h20.44C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z" />
										</svg>
									</a>
									{/* GitHub */}
									<a
										href="https://github.com/rohitkrdevs"
										target="_blank"
										rel="noopener noreferrer"
										className="group flex h-11 w-11 items-center justify-center rounded-xl
										border border-slate-200 bg-white
										text-slate-700
										shadow-sm

										transition-all duration-300
										hover:-translate-y-1 hover:shadow-md hover:border-slate-300

										dark:border-white/10 dark:bg-white/5 dark:text-(--fg)
										dark:hover:bg-white/10 dark:hover:shadow-none">
										<svg
											viewBox="0 0 24 24"
											fill="currentColor"
											className="h-4.5 w-4.5 transition group-hover:scale-110">
											<path d="M12 .5C5.7.5.7 5.7.7 12.2c0 5.2 3.4 9.6 8.2 11.2.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.5-4-1.5-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1 1.7.9 2.1 1.3.9 1.6 2.6 1.1 3.2.8.1-.7.4-1.1.7-1.4-2.6-.3-5.4-1.4-5.4-6 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.9 1.2 2 1.2 3.3 0 4.6-2.8 5.7-5.5 6 .5.5.8 1.2.8 2.4v3.5c0 .3.2.7.8.6 4.8-1.6 8.2-6 8.2-11.2C23.3 5.7 18.3.5 12 .5z" />
										</svg>
									</a>

									{/* Email */}
									<a
										href="mailto:rohitkrdevs@gmail.com"
										className="group flex h-11 w-11 items-center justify-center rounded-xl
										border border-slate-200 bg-white
										text-slate-700
										shadow-sm

										transition-all duration-300
										hover:-translate-y-1 hover:shadow-md hover:border-slate-300

										dark:border-white/10 dark:bg-white/5 dark:text-(--fg)
										dark:hover:bg-white/10 dark:hover:shadow-none">
										<svg
											viewBox="0 0 24 24"
											fill="currentColor"
											className="h-4.5 w-4.5 transition group-hover:scale-110">
											<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
										</svg>
									</a>
								</div>
							</div>

							{/* Buttons */}
							<div className="mt-10 flex flex-col gap-3">
								{/* Portfolio scroll */}
								<a
									href="#projects"
									className="btn btn-primary w-full text-center">
									View Projects
								</a>

								{/* Resume open in new tab */}
								<a
									href="/assets/Rohit_Kumar_Resume.pdf"
									target="_blank"
									rel="noopener noreferrer"
									className="btn btn-secondary w-full text-center">
									Download Resume
								</a>
							</div>
						</div>
					</motion.aside>

					{/* RIGHT CONTENT */}
					<div
						className="
							flex
							h-full
							flex-col
							justify-between
						">
						<div>
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.6 }}>
								{/* Label */}
								<p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
									About Me
								</p>

								{/* Heading */}
								<h1 className="mt-5 max-w-4xl text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
									I build <span className="text-gradient">modern digital</span>{" "}
									experiences with performance, scalability & beautiful UI.
								</h1>

								{/* Description */}
								<p className="mt-8 max-w-2xl text-lg leading-8 text-(--muted)">
									I specialize in full-stack web development using modern
									technologies like Next.js, React, TypeScript, PHP, and
									scalable backend architectures. My focus is crafting fast,
									clean, and user-centric digital products.
								</p>
							</motion.div>

							{/* Content Grid */}
							<div className="mt-14 grid gap-6 md:grid-cols-2">
								{[
									{
										title: "Full Stack Development",
										text: "Building scalable applications with modern frontend frameworks, backend APIs, databases, and optimized deployment workflows.",
									},
									{
										title: "UI & Performance",
										text: "Focused on premium UI design, responsive experiences, accessibility, animations, and web performance optimization.",
									},
									{
										title: "Business Solutions",
										text: "Developed admin dashboards, workflow automation systems, payment integrations, and SEO-friendly business platforms.",
									},
									{
										title: "Continuous Learning",
										text: "Constantly exploring modern technologies, architecture patterns, animations, and advanced frontend engineering practices.",
									},
								].map((item, index) => (
									<motion.div
										key={item.title}
										initial={{ opacity: 0, y: 25 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{
											duration: 0.5,
											delay: index * 0.08,
										}}
										className="
											card
											flex
											min-h-55
											flex-col
										">
										<h3 className="text-xl font-semibold">{item.title}</h3>

										<p className="mt-4 text-[15px] leading-7 text-(--muted)">
											{item.text}
										</p>
									</motion.div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
