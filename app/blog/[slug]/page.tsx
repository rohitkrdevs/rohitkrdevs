import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Calendar, ArrowLeft, ArrowUpRight } from "lucide-react";
import { shouldUnoptimizeBlogCover } from "@/lib/blog-cover";
import { getMediumBlogs } from "@/lib/medium";

// Global components
import Footer from "@/components/Footer";
import GoToTopButton from "@/components/GoToTopButton";
import AIChatWidget from "@/components/AIChatWidget";
import ThemeToggle from "@/components/ThemeToggle";

interface PageProps {
	params: Promise<{
		slug: string;
	}>;
}

export async function generateStaticParams() {
	const posts = await getMediumBlogs();
	return posts.map((post) => ({
		slug: post.slug,
	}));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const posts = await getMediumBlogs();
	const post = posts.find((p) => p.slug === slug);

	if (!post) {
		return {
			title: "Post Not Found | Rohit Kumar",
		};
	}

	return {
		title: `${post.title} | Rohit Kumar`,
		description: post.excerpt,
	};
}

export default async function BlogPostPage({ params }: PageProps) {
	const { slug } = await params;
	const posts = await getMediumBlogs();
	const post = posts.find((p) => p.slug === slug);

	if (!post) {
		notFound();
	}

	return (
		<div className="relative min-h-screen flex flex-col overflow-hidden bg-background text-foreground transition-colors duration-300">
			<main className="relative z-10 pt-12 md:pt-32 flex-1 pb-12">
				<article className="container section article-main">
					{/* Ambient Glow */}
					<div className="blog-glow-position"></div>

					<div className="blog-route-inner container relative z-10 mx-auto px-4">
						{/* Back Button */}
						<div className="mb-10">
							<Link
								href="/blog"
								className="article-back-link inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group">
								<ArrowLeft
									size={16}
									className="transition-transform group-hover:-translate-x-1"
								/>
								Back to Articles
							</Link>
						</div>

						{/* Medium Engagement Callout Banner */}
						<div className="glass rounded-2xl mb-8 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
							<div className="flex-1">
								<h4 className="text-sm font-bold text-(--fg) flex items-center gap-2 tracking-tight">
									<BookOpen size={16} className="text-(--accent)" />
									Reading from Medium.com RSS
								</h4>
								<p className="text-xs text-(--muted) mt-1.5 leading-relaxed">
									Claps, comments, and member reading times are only recorded directly on Medium. Consider supporting by reading the official post.
								</p>
							</div>
							<a
								href={post.link}
								target="_blank"
								rel="noopener noreferrer"
								className="group inline-flex items-center gap-1.5 px-4 py-2 bg-(--primary) text-(--primary-fg) rounded-lg text-xs font-bold transition-all duration-300 hover:-translate-y-0.5 shadow-md hover:shadow-lg flex-shrink-0">
								Open on Medium
								<ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
							</a>
						</div>

						{/* Header */}
						<header className="article-header mb-8">
							<div className="article-meta flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
								<span className="flex items-center gap-1">
									<Calendar size={14} />
									{new Date(post.pubDate).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										year: "numeric",
									})}
								</span>
								<span>• By {post.author}</span>
							</div>
							<h1 className="article-title text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
								{post.title}
							</h1>
							<p className="article-excerpt text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
								{post.excerpt}
							</p>
							<div className="article-tags flex flex-wrap gap-2">
								{post.tags.map((tag) => (
									<span
										key={tag}
										className="article-tag px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold">
										{tag}
									</span>
								))}
							</div>
						</header>

						{/* Cover Image */}
						<div className="article-hero-img-wrap relative w-full aspect-[21/10] rounded-2xl overflow-hidden mb-12 border border-slate-200 dark:border-slate-800">
							<Image
								src={post.coverUrl}
								alt={post.title}
								fill
								unoptimized={shouldUnoptimizeBlogCover(post.coverUrl)}
								className="object-cover"
								priority
							/>
						</div>

						{/* Main Content */}
						<section
							className="article-content prose dark:prose-invert max-w-none"
							dangerouslySetInnerHTML={{ __html: post.content }}
						/>

						{/* Bottom Callout Banner */}
						<div className="glass rounded-2xl mt-16 p-8 text-center">
							<h3 className="text-xl font-bold text-(--fg) tracking-tight mb-2">
								Enjoyed this article?
							</h3>
							<p className="text-sm text-(--muted) mb-6 max-w-lg mx-auto leading-relaxed">
								Support this post by clapping, commenting, or sharing directly on Medium! Your engagement helps reach a broader audience.
							</p>
							<a
								href={post.link}
								target="_blank"
								rel="noopener noreferrer"
								className="group inline-flex items-center gap-2 px-6 py-3 bg-(--primary) text-(--primary-fg) rounded-xl text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl">
								Support & Clap on Medium
								<ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
							</a>
						</div>
					</div>
				</article>
			</main>

			<div className="mt-auto relative z-20">
				<Footer />
			</div>

			<GoToTopButton />
			<AIChatWidget />
			<ThemeToggle />
		</div>
	);
}
