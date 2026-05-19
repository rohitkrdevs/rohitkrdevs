import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";

import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import Script from "next/script";

import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-space",
	display: "swap",
});

const SITE_URL = "https://rohitkrdevs.vercel.app";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),

	verification: {
		google: "SiKCMl-802tJYeDi9UlMBtizNcnSGuTraVCQn7ZX4-8",
	},

	title: {
		default: "Rohit Kumar | Web Developer in Ranchi",
		template: "%s | Rohit Kumar",
	},

	description:
		"Rohit Kumar is a web developer in Ranchi specializing in Next.js, React, Tailwind CSS, TypeScript, and modern full stack web applications.",

	keywords: [
		"Rohit Kumar Web Developer Ranchi",
		"Rohit Kumar",
		"Web Developer in Ranchi",
		"Frontend Developer Ranchi",
		"Next.js Developer Ranchi",
		"React Developer Ranchi",
		"Full Stack Developer Ranchi",
		"Freelance Web Developer Ranchi",
		"MERN Stack Developer",
		"Next.js Developer",
		"React Developer",
		"TypeScript Developer",
		"Tailwind CSS Developer",
		"Portfolio Website",
	],

	authors: [{ name: "Rohit Kumar" }],
	creator: "Rohit Kumar",

	alternates: {
		canonical: SITE_URL,
	},

	openGraph: {
		title: "Rohit Kumar | Web Developer in Ranchi",
		description:
			"Rohit Kumar is a modern web developer in Ranchi building fast, responsive, and SEO optimized web applications using Next.js and React.",
		url: SITE_URL,
		siteName: "Rohit Portfolio",
		type: "website",
		images: [
			{
				url: "https://rohitkrdevs.vercel.app/assets/rohitkrdevs.jpg",
				width: 1200,
				height: 630,
				alt: "Rohit Kumar | Web Developer in Ranchi",
			},
		],
	},

	twitter: {
		card: "summary_large_image",
		title: "Rohit Kumar | Web Developer in Ranchi",
		description:
			"Rohit Kumar is a modern web developer in Ranchi building fast, responsive, and SEO optimized web applications using Next.js and React.",
		images: ["https://rohitkrdevs.vercel.app/assets/rohitkrdevs.jpg"],
	},

	icons: {
		icon: "/assets/images/favicon_io/favicon.ico",
		shortcut: "/assets/images/favicon_io/favicon.ico",
		apple: "/assets/images/favicon_io/apple-touch-icon.png",
		other: [
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				url: "/assets/images/favicon_io/favicon-32x32.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "16x16",
				url: "/assets/images/favicon_io/favicon-16x16.png",
			},
		],
	},

	category: "technology",

	manifest: "/assets/images/favicon_io/site.webmanifest",

	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	themeColor: "#020617",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${inter.variable} ${spaceGrotesk.variable}`}>
			<body
				className="
					min-h-screen
					bg-(--bg)
					text-(--fg)
					font-(family-name:--font-inter)
					antialiased
					selection:bg-blue-500/20
					selection:text-white
				">
				{/* Iconify */}
				<Script
					src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js"
					strategy="afterInteractive"
				/>

				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange>
					<div className="relative overflow-hidden">
						{/* Background Effects */}
						<div className="blur-bg -top-30 -left-30" />
						<div className="blur-bg -bottom-37.5 -right-37.5" />

						{/* Main Content */}
						<main className="relative z-10">{children}</main>
					</div>
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{
							__html: JSON.stringify({
								"@context": "https://schema.org",
								"@type": "Person",
								name: "Rohit Kumar",
								url: "https://rohitkrdevs.vercel.app",
								jobTitle: "Web Developer in Ranchi",
								sameAs: [
									"https://github.com/rohitkrdevs",
									"https://linkedin.com/in/rohitkrdevs",
									"https://instagram.com/rohitkrdevs",
									"https://facebook.com/rohitkrdevs",
									"https://x.com/rohitkrdevs",
								],
								knowsAbout: [
									"Next.js",
									"React",
									"TypeScript",
									"Tailwind CSS",
									"Full Stack Development",
								],
							}),
						}}
					/>
				</ThemeProvider>
			</body>
			<GoogleTagManager gtmId="GTM-P2G6MFK8" />
		</html>
	);
}
