import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Calendar, ArrowLeft } from "lucide-react";
import { shouldUnoptimizeBlogCover } from "@/lib/blog-cover";
import { getMediumBlogs } from "@/lib/medium";

// Global components
import Footer from "@/components/Footer";
import GoToTopButton from "@/components/GoToTopButton";
import AIChatWidget from "@/components/AIChatWidget";
import ThemeToggle from "@/components/ThemeToggle";
// import Navbar from "@/components/Navbar"; // Uncomment if you want the navbar here too!

export const metadata: Metadata = {
	title: "Blog | Rohit Kumar",
	description:
		"Technical articles, engineering notes, and automated software industry analysis.",
};

export const revalidate = 3600;

function formatDate(value: string | null): string {
	if (!value) {
		return "Recently";
	}

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(value));
}

export default async function BlogPage() {
	const articles = await getMediumBlogs();

	return (
		<div className="relative min-h-screen flex flex-col overflow-hidden bg-background text-foreground transition-colors duration-300">
			{/* <Navbar /> Uncomment this if you want your standard navbar on the blog page */}

			<main className="relative z-10 pt-12 md:pt-32 flex-1 pb-12">
				<section className="container section blog-section">
					{/* Your Custom Ambient Glow */}
					<div className="blog-glow-position"></div>

					{/* Content Layer */}
					<div className="blog-route-inner container relative z-10 mx-auto px-4">
						{/* 1. Back Button */}
						<div className="mb-10">
							<Link
								href="/"
								className="article-back-link inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group">
								<ArrowLeft
									size={16}
									className="transition-transform group-hover:-translate-x-1"
								/>
								Back to Home
							</Link>
						</div>

						{/* 2. Header */}
						<div className="blog-header-wrap">
							<div>
								<p className="blog-label">Articles & Insights</p>
								<h1 className="blog-heading">Engineering Field Notes</h1>
								<p className="blog-subheading">
									Technical articles, engineering notes, and software
									architecture posts shared on Medium.
								</p>
							</div>
						</div>

						{/* 3. Grid / Empty State */}
						{articles.length === 0 ? (
							<div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center shadow-sm dark:border-white/10 dark:bg-white/3">
								<BookOpen
									aria-hidden="true"
									className="mx-auto mb-4 h-8 w-8 text-slate-400 dark:text-slate-500"
								/>
								<h2 className="text-2xl font-bold text-slate-950 dark:text-white">
									No articles published yet
								</h2>
								<p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-400">
									Please check back later!
								</p>
							</div>
						) : (
							<div className="blog-grid">
								{articles.map((post) => {
									const publishedDate = post.pubDate;

									return (
										<Link
											key={post.id}
											href={`/blog/${post.slug}`}
											className="blog-card focus:outline-none"
											aria-label={`Read ${post.title}`}>
											<div className="blog-card-image-wrap">
												<Image
													src={post.coverUrl}
													alt=""
													fill
													unoptimized={shouldUnoptimizeBlogCover(post.coverUrl)}
													sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
													className="object-cover transition duration-500 hover:scale-105"
												/>
											</div>

											<div className="blog-card-meta">
												<Calendar size={14} aria-hidden="true" />
												{formatDate(publishedDate)}
												{post.author && (
													<span className="ml-2">• {post.author}</span>
												)}
											</div>

											<h2 className="blog-card-title">{post.title}</h2>

											{post.excerpt && (
												<p className="blog-card-desc">{post.excerpt}</p>
											)}

											<div className="blog-tags">
												{post.tags?.slice(0, 3).map((tag) => (
													<span key={tag} className="blog-tag">
														{tag}
													</span>
												))}
											</div>
										</Link>
									);
								})}
							</div>
						)}
					</div>
				</section>
			</main>

			{/* Global Utility Components */}
			<div className="mt-auto relative z-20">
				<Footer />
			</div>

			<GoToTopButton />
			<AIChatWidget />
			<ThemeToggle />
		</div>
	);
}
