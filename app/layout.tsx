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

const SITE_URL = "https://rohitkrdevs.github.io"; // 🔥 change this

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),

	title: {
		default: "Rohit Kumar | Web Developer in Ranchi",
		template: "%s | Rohit Kumar",
	},

	description:
		"Modern Next.js portfolio showcasing projects, skills, experience, and contact information with clean UI and smooth animations.",

	keywords: [
		"Rohit Kumar",
		"Portfolio",
		"Next.js Developer",
		"React Developer",
		"Full Stack Developer",
		"Frontend Engineer",
	],

	authors: [{ name: "Rohit Kumar" }],
	creator: "Rohit Kumar",

	alternates: {
		canonical: SITE_URL,
	},

	openGraph: {
		title: "Rohit Kumar | Web Developer in Ranchi",
		description:
			"Modern portfolio built with Next.js, Tailwind CSS, and animations.",
		url: SITE_URL,
		siteName: "Rohit Portfolio",
		type: "website",
		images: [
			{
				url: "/assets/rohitkrdevs.jpg",
				width: 1200,
				height: 630,
				alt: "Rohit Portfolio Preview",
			},
		],
	},

	twitter: {
		card: "summary_large_image",
		title: "Rohit Kumar | Web Developer in Ranchi",
		description: "Modern portfolio built using Next.js and Tailwind CSS.",
		images: ["/og-image.png"],
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

	manifest: "/assets/images/favicon_io/site.webmanifest",

	robots: {
		index: true,
		follow: true,
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
				</ThemeProvider>
			</body>
		</html>
	);
}
