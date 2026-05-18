import Navbar from "@/components/Navbar";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Certifications from "@/components/Certifications";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import GoToTopButton from "@/components/GoToTopButton";
import AIChatWidget from "@/components/AIChatWidget";

export default function Home() {
	return (
		<div className="relative min-h-screen overflow-hidden">
			{/* Background Effects */}
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="blur-bg top-0 left-0" />
				<div className="blur-bg bottom-0 right-0" />
			</div>

			{/* Navbar */}
			<Navbar />

			{/* Main Content */}
			<main className="relative z-10 pt-28 md:pt-32">
				{/* Hero / About */}
				<section
					id="about"
					className="
						container
						section					
					">
					<About />
				</section>

				{/* Experience */}
				<section
					id="experience"
					className="
						container
						section
					">
					<Experience />
				</section>

				{/* Skills */}
				<section
					id="skills"
					className="
						container
						section
					">
					<Skills />
				</section>

				{/* Projects */}
				<section
					id="projects"
					className="
						container
						section
					">
					<Projects />
				</section>

				{/* Certifications */}
				<section
					id="certifications"
					className="
						container
						section
					">
					<Certifications />
				</section>

				{/* Contact */}
				<section
					id="contact"
					className="
						container
						section
					">
					<Contact />
				</section>
			</main>

			{/* Footer */}
			<Footer />

			{/* Go To Top Button */}
			<GoToTopButton />

			{/* AI Assistant */}
			<AIChatWidget />
		</div>
	);
}
