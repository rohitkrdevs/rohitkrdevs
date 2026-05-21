import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ArrowUpRight, BookOpen, Calendar, ArrowLeft } from "lucide-react";

// Global components
import Footer from "@/components/Footer";
import GoToTopButton from "@/components/GoToTopButton";
import AIChatWidget from "@/components/AIChatWidget";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
	title: "Blog | Rohit Kumar",
	description:
		"Technical articles, engineering notes, and automated software industry analysis.",
};

export const revalidate = 3600;

type BlogCard = {
	id: number | string;
	title: string;
	slug: string;
	excerpt: string | null;
	image_url: string | null;
	published_at: string | null;
	updated_at: string | null;
	tags: string[] | null;
	author_name: string | null;
};

const FALLBACK_IMAGE =
	"https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80";

function getSupabaseClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

	if (!supabaseUrl || !supabaseKey) {
		throw new Error("Missing Supabase public environment variables.");
	}

	return createClient(supabaseUrl, supabaseKey, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
		},
	});
}

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
	const supabase = getSupabaseClient();
	const { data: posts, error } = await supabase
		.from("blogs")
		.select(
			"id, title, slug, excerpt, image_url, published_at, updated_at, tags, author_name",
		)
		.eq("status", "published")
		.order("published_at", { ascending: false });

	if (error) {
		throw new Error(`Unable to load blog posts: ${error.message}`);
	}

	const articles = (posts ?? []) as BlogCard[];

	return (
		<main className="min-h-screen bg-backgroundtext-foreground transition-colors duration-300">
			<section className="container mx-auto max-w-7xl px-4 pb-24 pt-12 ">
				{/* 1. Back Button */}
				<div className="mb-10">
					<Link
						href="/"
						className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group">
						<ArrowLeft
							size={16}
							className="transition-transform group-hover:-translate-x-1"
						/>
						Back to Home
					</Link>
				</div>

				<div className="mb-12 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
					<div className="max-w-3xl">
						<p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-400">
							Articles & Insights
						</p>
						<h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
							Engineering Field Notes
						</h1>
						<p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
							Automated technical deep-dives, architecture notes, and practical
							software analysis built from current engineering signals.
						</p>
					</div>
				</div>

				{articles.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center shadow-sm dark:border-white/10 dark:bg-white/3">
						<BookOpen
							aria-hidden="true"
							className="mx-auto mb-4 h-8 w-8 text-slate-400"
						/>
						<h2 className="text-2xl font-bold text-slate-950 dark:text-white">
							No articles published yet
						</h2>
						<p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
							The daily automation is ready to publish the next technical
							article once the cron endpoint runs.
						</p>
					</div>
				) : (
					<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
						{articles.map((post) => {
							const href = `/blog/${post.slug}`;
							const publishedDate = post.published_at ?? post.updated_at;

							return (
								<Link
									key={post.id}
									href={href}
									className="group block h-full overflow-hidden rounded-2xl border border-slate-200 bg-white/85 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-white/10 dark:bg-white/4 dark:hover:border-blue-400/40"
									aria-label={`Read ${post.title}`}>
									<article className="flex h-full flex-col">
										<div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
											<Image
												src={post.image_url || FALLBACK_IMAGE}
												alt=""
												fill
												sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
												className="object-cover transition duration-500 group-hover:scale-105"
											/>
										</div>

										<div className="flex flex-1 flex-col p-6">
											<div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
												<span className="inline-flex items-center gap-2">
													<Calendar
														aria-hidden="true"
														className="h-3.5 w-3.5"
													/>
													{formatDate(publishedDate)}
												</span>
												{post.author_name && <span>{post.author_name}</span>}
											</div>

											<h2 className="text-xl font-bold leading-snug tracking-tight text-slate-950 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
												{post.title}
											</h2>

											{post.excerpt && (
												<p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
													{post.excerpt}
												</p>
											)}

											<div className="mt-auto flex items-end justify-between gap-4 pt-6">
												<div className="flex flex-wrap gap-2">
													{post.tags?.slice(0, 3).map((tag) => (
														<span
															key={tag}
															className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600 dark:border-white/10 dark:bg-white/4 dark:text-slate-300">
															{tag}
														</span>
													))}
												</div>
												<ArrowUpRight
													aria-hidden="true"
													className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400"
												/>
											</div>
										</div>
									</article>
								</Link>
							);
						})}
					</div>
				)}
			</section>

			{/* 2. Added Global Utility Components at the bottom */}
			{/* Fixed Footer */}
			<div className="fixed bottom-0 left-0 w-full z-50">
				<Footer />
			</div>

			{/* Go To Top Button */}
			<GoToTopButton />

			{/* AI Assistant */}
			<AIChatWidget />

			{/* Theme Toggle */}
			<ThemeToggle />
		</main>
	);
}
