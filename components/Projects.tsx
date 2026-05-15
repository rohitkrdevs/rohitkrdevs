"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, type Variants } from "framer-motion";

const projects = [
	{
		title: "Curesta Health",
		desc: "Healthcare and medical platform focused on modern patient experience, responsive UI, optimized performance, healthcare service management, and scalable workflows.",
		img: "/assets/images/curesta-health.jpg",
		link: "https://curesta.health",
		stack: [
			"HTML5",
			"CSS3",
			"JavaScript ES6",
			"Bootstrap",
			"jQuery",
			"PHP",
			"MySQL",
			"Owl Carousel",
		],
	},

	{
		title: "MS Hospital",
		desc: "Hospital management system with responsive UI, SEO optimization, service pages, and patient-focused experience.",
		img: "/assets/images/ms-hospital.jpg",
		link: "https://mshospital.in",
		stack: [
			"HTML5",
			"CSS3",
			"JavaScript ES6",
			"jQuery",
			"Bootstrap",
			"Owl Carousel",
			"Slick Slider",
			"Animate.css",
			"Parallax.js",
			"Particles.js",
		],
	},

	{
		title: "Ved Times",
		desc: "News and media platform with optimized article structure, category management, responsive design, and SEO-friendly architecture.",
		img: "/assets/images/ved-times.jpg",
		link: "https://vedtimes.com",
		stack: [
			"WordPress",
			"PHP",
			"MySQL",
			"HTML5",
			"CSS3",
			"JavaScript",
			"jQuery",
			"Elementor",
			"SEO Optimization",
			"Responsive Design",
		],
	},

	{
		title: "Ashok Karan",
		desc: "Personal branding and professional business website with custom layouts, responsive sections, and optimized content structure.",
		img: "/assets/images/ashok-karan.jpg",
		link: "https://ashokkaran.com",
		stack: [
			"WordPress",
			"PHP",
			"MySQL",
			"HTML5",
			"CSS3",
			"JavaScript",
			"jQuery",
			"Elementor",
			"REST API",
			"SEO Optimization",
		],
	},

	{
		title: "Resettle Worldwide",
		desc: "Immigration and relocation platform featuring structured workflows, inquiry forms, responsive design, and service management.",
		img: "/assets/images/resettle-worldwide.jpg",
		link: "https://resettleworldwide.com",
		stack: [
			"HTML5",
			"CSS3",
			"JavaScript",
			"Bootstrap 5",
			"Custom CSS",
			"Vanilla JS",
			"Responsive Design",
		],
	},

	{
		title: "Cure Meds",
		desc: "Pharmaceutical and healthcare platform with modern UI, optimized structure, and business-focused functionality for better engagement.",
		img: "/assets/images/cure-meds.jpg",
		link: "https://cure-meds.com",
		stack: [
			"HTML5",
			"CSS3",
			"JavaScript",
			"jQuery",
			"Bootstrap",
			"WOW.js",
			"GSAP",
			"Custom CSS",
			"Custom JS",
		],
	},

	{
		title: "DD Hospitals",
		desc: "Healthcare and hospital management website focused on clean UX, patient flows, service architecture, and performance optimization.",
		img: "/assets/images/dd-hospitals.jpg",
		link: "https://ddhospitals.com",
		stack: [
			"HTML5",
			"CSS3",
			"JavaScript",
			"jQuery",
			"Bootstrap",
			"Odometer.js",
			"Custom CSS",
			"Custom JS",
		],
	},

	{
		title: "Comeback Massage",
		desc: "Wellness and massage platform with modern UI, booking flow optimization, and mobile-first responsive design.",
		img: "/assets/images/comeback-massage.jpg",
		link: "https://comebackmassage.com",
		stack: [
			"HTML5",
			"CSS3",
			"JavaScript",
			"jQuery",
			"Bootstrap",
			"GSAP",
			"WOW.js",
			"Swiper.js",
			"Popper.js",
			"Custom CSS",
			"Custom JS",
		],
	},
];

export default function Projects() {
	const sliderRef = useRef<HTMLDivElement>(null);

	const scroll = (dir: "left" | "right") => {
		if (!sliderRef.current) return;

		const width = 420;

		sliderRef.current.scrollBy({
			left: dir === "left" ? -width : width,
			behavior: "smooth",
		});
	};

	/* ANIMATIONS */
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
		hidden: { opacity: 0, y: 40 },
		show: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				ease: [0.25, 0.1, 0.25, 1],
			},
		},
	};

	const header = {
		hidden: { opacity: 0, y: 20 },
		show: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.6 },
		},
	};

	return (
		<div id="projects" className="projects-section">
			<div className="container">
				{/* HEADER */}
				<motion.div
					variants={header}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true }}
					className="projects-header">
					<p className="projects-label">Portfolio</p>
					<h2 className="projects-title">
						Real-world projects built for performance & scalability
					</h2>
				</motion.div>

				{/* CONTROLS */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="slider-controls">
					<button onClick={() => scroll("left")} className="slider-btn">
						←
					</button>
					<button onClick={() => scroll("right")} className="slider-btn">
						→
					</button>
				</motion.div>

				{/* SLIDER */}
				<motion.div
					ref={sliderRef}
					className="projects-slider"
					variants={container}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, amount: 0.2 }}>
					{projects.map((project) => (
						<motion.article
							key={project.title}
							className="project-card"
							variants={card}>
							{/* IMAGE */}
							<div className="project-image-wrapper">
								<Image
									src={project.img}
									alt={project.title}
									width={800}
									height={500}
									className="project-image"
								/>
							</div>

							{/* CONTENT */}
							<div className="project-content">
								<div className="project-body">
									<h3 className="project-title">{project.title}</h3>
									<p className="project-desc">{project.desc}</p>

									<div className="project-stack">
										{project.stack.map((item) => (
											<span key={item} className="project-pill">
												{item}
											</span>
										))}
									</div>
								</div>

								{/* FOOTER ALWAYS BOTTOM */}
								<div className="project-footer">
									<a
										href={project.link}
										target="_blank"
										rel="noopener noreferrer"
										className="project-btn">
										View Project
										<span className="project-btn-arrow">→</span>
									</a>
								</div>
							</div>
						</motion.article>
					))}
				</motion.div>
			</div>
		</div>
	);
}
