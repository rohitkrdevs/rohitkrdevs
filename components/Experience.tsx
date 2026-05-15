"use client";

import { motion, type Variants } from "framer-motion";

export default function Experience() {
	const experiences = [
		{
			period: "Jul 2021 — Present",
			role: "Web Developer",
			company: "Curesta Global Limited",
			desc: "Developed scalable internal tools, dashboards, and workflow systems using PHP, JavaScript, and MySQL.",
			points: [
				"Built admin dashboards and workflow systems",
				"Improved application performance and responsiveness",
				"Integrated Razorpay and Stripe payment gateways",
				"Optimized SEO structure and architecture",
				"Maintained databases and backend workflows",
			],
			stack: ["PHP", "MySQL", "JavaScript", "WordPress", "Razorpay", "Stripe"],
		},
		{
			period: "Nov 2020 — Jun 2021",
			role: "Web Developer",
			company: "Vmak Research",
			desc: "Built dynamic websites using PHP and WordPress with focus on performance, deployment, and maintainability.",
			points: [
				"Developed responsive WordPress websites",
				"Customized themes and plugins",
				"Improved SEO and page speed",
				"Managed hosting and deployments",
			],
			stack: ["PHP", "WordPress", "HTML", "CSS"],
		},
		{
			period: "Jul 2019 — Oct 2020",
			role: "Junior Web Developer",
			company: "GrubWeb",
			desc: "Worked on responsive client websites and collaborated on UI improvements and debugging.",
			points: [
				"Built responsive client websites",
				"Worked with client requirements",
				"Performed debugging and testing",
				"Improved layout usability",
			],
			stack: ["HTML", "CSS", "JavaScript"],
		},
	];

	// ✅ FIXED VARIANTS (TypeScript-safe)
	const container: Variants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.15,
			},
		},
	};

	const card: Variants = {
		hidden: { opacity: 0, y: 40 },
		show: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				ease: [0.25, 0.1, 0.25, 1], // ✅ FIXED (no TS error)
			},
		},
	};

	return (
		<div id="experience" className="relative overflow-hidden">
			<div className="container relative z-10">
				{/* HEADER */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="max-w-3xl">
					<p className="experience-label">Experience</p>

					<h2 className="experience-heading">
						Crafting scalable digital products with modern technologies.
					</h2>

					<p className="experience-subheading">
						I focus on building performant web applications, internal
						dashboards, and polished user experiences with strong attention to
						scalability, maintainability, and clean UI systems.
					</p>
				</motion.div>

				{/* CARDS */}
				<motion.div
					className="mt-16 grid gap-6 lg:grid-cols-12 lg:gap-7"
					variants={container}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, amount: 0.2 }}>
					{experiences.map((exp, index) => (
						<motion.div
							key={exp.company}
							variants={card}
							whileHover={{ y: -6 }}
							className={`experience-card ${
								index === 0
									? "lg:col-span-7"
									: index === 1
										? "lg:col-span-5"
										: "lg:col-span-12"
							}`}>
							{/* TOP */}
							<div className="relative z-10 flex flex-wrap items-start justify-between gap-5">
								<div>
									<p className="experience-period">{exp.period}</p>
									<h3 className="experience-role">{exp.role}</h3>
									<p className="experience-company">{exp.company}</p>
								</div>

								<div className="experience-badge">
									{index === 0 ? "Current Position" : "Past Experience"}
								</div>
							</div>

							{/* DESCRIPTION */}
							<p className="experience-description">{exp.desc}</p>

							{/* POINTS */}
							<div className="experience-points">
								{exp.points.map((point) => (
									<div key={point} className="experience-point-card">
										<div className="experience-point-dot" />
										<p className="experience-point-text">{point}</p>
									</div>
								))}
							</div>

							{/* STACK */}
							<div className="experience-stack">
								{exp.stack.map((tech) => (
									<span key={tech} className="experience-pill">
										{tech}
									</span>
								))}
							</div>
						</motion.div>
					))}
				</motion.div>
			</div>
		</div>
	);
}
