"use client";

import { motion, type Variants } from "framer-motion";

export default function Skills() {
	const skills = [
		{
			title: "Frontend Development",
			desc: "Modern UI development and responsive web interfaces",
			variant: "",
			items: [
				"HTML5",
				"CSS3",
				"JavaScript",
				"Tailwind CSS",
				"Bootstrap",
				"Responsive Design",
				"UI Development",
				"Cross Browser Compatibility",
			],
		},
		{
			title: "Backend Development",
			desc: "Scalable backend systems and application architecture",
			variant: "",
			items: [
				"PHP",
				"MySQL",
				"CRUD Applications",
				"REST APIs",
				"Authentication Systems",
				"Admin Dashboards",
				"Database Optimization",
				"Business Logic Development",
			],
		},
		{
			title: "Performance & Integrations",
			desc: "Optimization, security, analytics, and integrations",
			variant: "skills-card-wide",
			items: [
				"Razorpay",
				"Stripe",
				"SEO",
				"Google Analytics",
				"Performance Optimization",
				"Page Speed Optimization",
				"Security Best Practices",
				"Debugging",
			],
		},
		{
			title: "CMS & WordPress",
			desc: "WordPress customization, optimization, and integrations",
			variant: "",
			items: [
				"WordPress",
				"Theme Customization",
				"Plugin Integration",
				"Elementor",
				"WooCommerce",
				"SEO Optimization",
				"Website Migration",
			],
		},
		{
			title: "Tools & Platforms",
			desc: "Development workflow and deployment ecosystem",
			variant: "",
			items: [
				"Git",
				"GitHub",
				"VS Code",
				"cPanel",
				"Hostinger",
				"Cloudflare",
				"FileZilla",
				"Linux Hosting",
				"Deployment",
			],
		},
	];

	/* ANIMATION VARIANTS */
	const container: Variants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.12,
			},
		},
	};

	const card: Variants = {
		hidden: { opacity: 0, y: 30 },
		show: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				ease: [0.25, 0.1, 0.25, 1],
			},
		},
	};

	return (
		<section id="skills" className="skills-section scroll-mt-32">
			<div className="container relative z-10">
				{/* HEADER */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="skills-header">
					<p className="skills-label">Skills & Expertise</p>

					<h2 className="skills-heading">
						Building modern web experiences with scalable technologies.
					</h2>

					<p className="skills-subheading">
						A combination of frontend engineering, backend systems, CMS
						development, performance optimization, and deployment workflows
						focused on creating fast and maintainable digital products.
					</p>
				</motion.div>

				{/* GRID */}
				<motion.div
					className="skills-grid"
					variants={container}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, amount: 0.2 }}>
					{skills.map((skill) => (
						<motion.div
							key={skill.title}
							variants={card}
							whileHover={{ y: -6 }}
							className={`skills-card ${skill.variant ?? ""}`}>
							<div className="skills-card-top">
								<div className="skills-icon-wrap">
									<div className="skills-icon-dot" />
								</div>

								<div>
									<h3 className="skills-card-title">{skill.title}</h3>
									<p className="skills-card-desc">{skill.desc}</p>
								</div>
							</div>

							<div className="skills-tags">
								{skill.items.map((item) => (
									<span key={item} className="skills-tag">
										{item}
									</span>
								))}
							</div>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
