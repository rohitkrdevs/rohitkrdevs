"use client";

import { useRef, useState } from "react";
import { motion, Variants } from "framer-motion";

type ToastType = {
	type: "success" | "error" | "";
	message: string;
};

export default function Contact() {
	const [loading, setLoading] = useState(false);
	const [toast, setToast] = useState<ToastType>({ type: "", message: "" });

	// ✅ FIX: useRef instead of variable (fixes ESLint immutability error)
	const toastTimer = useRef<NodeJS.Timeout | null>(null);

	const FORMSPREE_ENDPOINT = "https://formspree.io/f/mpqbgqpn";

	const showToast = (type: "success" | "error", message: string) => {
		setToast({ type, message });

		// clear previous timer if exists
		if (toastTimer.current) {
			clearTimeout(toastTimer.current);
		}

		toastTimer.current = setTimeout(() => {
			setToast({ type: "", message: "" });
		}, 3000);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		// ✅ FIX: store form BEFORE async
		const form = e.currentTarget;

		const formData = new FormData(form);

		try {
			const res = await fetch(FORMSPREE_ENDPOINT, {
				method: "POST",
				body: formData,
				headers: {
					Accept: "application/json",
				},
			});

			if (res.ok) {
				showToast("success", "Message received successfully!");

				// ✅ SAFE RESET (no TS error)
				form.reset();
			} else {
				showToast("error", "Message could not be sent. Try again.");
			}
		} catch {
			showToast("error", "Network error. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// Animations
	const container: Variants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: { staggerChildren: 0.12 },
		},
	};

	const item: Variants = {
		hidden: { opacity: 0, y: 20 },
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
		<div id="contact" className="contact-section relative">
			{/* TOAST */}
			{toast.message && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium border backdrop-blur-md shadow-lg
						${
							toast.type === "success"
								? "bg-green-500/10 text-green-500 border-green-500/30"
								: "bg-red-500/10 text-red-500 border-red-500/30"
						}`}>
					{toast.message}
				</motion.div>
			)}

			<div className="container  pb-0 md:pb-20">
				{/* HEADER */}
				<motion.div
					className="contact-header"
					variants={container}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true }}>
					<motion.p className="contact-label" variants={item}>
						Contact
					</motion.p>

					<motion.h2 className="contact-title" variants={item}>
						Get In Touch
					</motion.h2>

					<motion.p className="contact-desc" variants={item}>
						Want to discuss something or collaborate? Contact me and I’ll get
						back to you soon.
					</motion.p>
				</motion.div>

				{/* FORM */}
				<motion.form
					onSubmit={handleSubmit}
					className="contact-card"
					variants={container}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true }}>
					<motion.div className="contact-grid" variants={item}>
						<input
							type="text"
							name="name"
							required
							placeholder="Your Name"
							className="contact-input"
						/>

						<input
							type="email"
							name="email"
							required
							placeholder="Your Email"
							className="contact-input"
						/>
					</motion.div>

					<motion.textarea
						name="message"
						rows={6}
						required
						placeholder="Your Message"
						className="contact-textarea"
						variants={item}
					/>

					<motion.div className="contact-footer" variants={item}>
						<button type="submit" disabled={loading} className="contact-btn">
							{loading ? "Sending..." : "Send Message"}
						</button>
					</motion.div>
				</motion.form>
			</div>
		</div>
	);
}
