"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";

const certifications = [
	{
		title: "Responsive Web Design Certification",
		issuer: "freeCodeCamp",
		icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/freecodecamp.svg",
		link: "https://www.freecodecamp.org/certification/rohitkrdevs/responsive-web-design",
		desc: "HTML5, CSS3, Flexbox, Grid, responsive design and accessibility.",
	},
	{
		title: "JavaScript Algorithms & Data Structures",
		issuer: "freeCodeCamp",
		icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/freecodecamp.svg",
		link: "https://www.freecodecamp.org/certification/rohitkrdevs/javascript-algorithms-and-data-structures",
		desc: "ES6, OOP, functional programming, algorithms and data structures.",
	},
	{
		title: "LinkedIn Learning Certification",
		issuer: "LinkedIn Learning",
		icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg",
		link: "https://www.linkedin.com",
		desc: "Modern web development workflows and professional skills.",
	},
	{
		title: "Great Learning Certification",
		issuer: "Great Learning",
		icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/greatlearning.svg",
		link: "https://verify.mygreatlearning.com/verify/QRLHYPKA",
		desc: "Software engineering fundamentals and practical development skills.",
	},
];

/* ANIMATION */
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

export default function Certifications() {
	return (
		<div id="certifications" className="cert-section scroll-mt-24">
			<div className="container">
				{/* HEADER */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="max-w-3xl">
					<p className="experience-label">Certifications</p>

					<h2 className="experience-heading">
						Industry certifications in modern web development.
					</h2>

					<p className="experience-subheading">
						A collection of verified learning experiences focused on frontend,
						backend, and real-world software engineering practices.
					</p>
				</motion.div>

				{/* GRID */}
				<motion.div
					className="cert-grid mt-12"
					variants={container}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, amount: 0.2 }}>
					{certifications.map((cert) => (
						<motion.div key={cert.title} variants={card} className="cert-card">
							<div className="cert-top">
								<div className="cert-icon">
									<Image
										src={cert.icon}
										alt={cert.issuer}
										width={28}
										height={28}
										className="cert-img"
									/>
								</div>

								<div className="flex-1">
									<h3 className="cert-title">{cert.title}</h3>
									<p className="cert-issuer">Issued by {cert.issuer}</p>
								</div>

								<a href={cert.link} target="_blank" className="project-btn">
									View
								</a>
							</div>

							<p className="cert-desc">{cert.desc}</p>
						</motion.div>
					))}
				</motion.div>
			</div>
		</div>
	);
}
