import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, Calendar, User } from "lucide-react";

export const revalidate = 3600;

type PageProps = {
	params: Promise<{ slug: string }>;
};

type BlogPost = {
	id: number | string;
	title: string;
	slug: string;
	excerpt: string | null;
	content: string | null;
	content_format: string | null;
	headings: { level: number; id: string; text: string }[] | null;
	seo_title: string | null;
	seo_description: string | null;
	seo_keywords: string[] | null;
	canonical_url: string | null;
	image_url: string | null;
	published_at: string | null;
	updated_at: string | null;
	author_name: string | null;
	author_avatar: string | null;
	tags: string[] | null;
	status: string | null;
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

async function getPost(slug: string): Promise<BlogPost | null> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from("blogs")
		.select("*")
		.eq("slug", slug)
		.eq("status", "published")
		.maybeSingle();

	if (error) {
		throw new Error(`Unable to load blog post: ${error.message}`);
	}

	return data as BlogPost | null;
}

function formatDate(value: string | null): string {
	if (!value) {
		return "Recently";
	}

	return new Intl.DateTimeFormat("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	}).format(new Date(value));
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const post = await getPost(slug);

	if (!post) {
		return {
			title: "Article Not Found",
		};
	}

	const title = post.seo_title || post.title;
	const description = post.seo_description || post.excerpt || "";

	return {
		title,
		description,
		keywords: post.seo_keywords || undefined,
		alternates: post.canonical_url
			? {
					canonical: post.canonical_url,
				}
			: undefined,
		openGraph: {
			title,
			description,
			type: "article",
			images: post.image_url ? [{ url: post.image_url }] : undefined,
			publishedTime: post.published_at || undefined,
			modifiedTime: post.updated_at || undefined,
			authors: post.author_name ? [post.author_name] : undefined,
		},
	};
}

export default async function BlogPostPage({ params }: PageProps) {
	const { slug } = await params;
	const post = await getPost(slug);

	if (!post) {
		notFound();
	}

	const publishedDate = post.published_at ?? post.updated_at;

	return (
		<main className="min-h-screen bg-background px-4 pb-24 pt-32 text-foreground">
			<article className="container mx-auto max-w-4xl">
				<Link
					href="/blog"
					className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-400 dark:hover:text-white">
					<ArrowLeft aria-hidden="true" className="h-4 w-4" />
					Back to articles
				</Link>

				<header className="mb-10">
					<div className="mb-5 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
						<span className="inline-flex items-center gap-2">
							<Calendar aria-hidden="true" className="h-4 w-4" />
							{formatDate(publishedDate)}
						</span>
						<span className="inline-flex items-center gap-2">
							<User aria-hidden="true" className="h-4 w-4" />
							{post.author_name || "System Automation"}
						</span>
					</div>

					<h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
						{post.title}
					</h1>

					{post.excerpt && (
						<p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
							{post.excerpt}
						</p>
					)}

					{post.tags && post.tags.length > 0 && (
						<div className="mt-6 flex flex-wrap gap-2">
							{post.tags.map((tag) => (
								<span
									key={tag}
									className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
									{tag}
								</span>
							))}
						</div>
					)}
				</header>

				<div className="relative mb-12 aspect-[21/10] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm dark:border-white/10 dark:bg-slate-900">
					<Image
						src={post.image_url || FALLBACK_IMAGE}
						alt=""
						fill
						priority
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
						className="object-cover"
					/>
				</div>

				<div
					className="prose prose-lg max-w-none dark:prose-invert prose-headings:scroll-mt-28 prose-headings:font-bold prose-h2:mt-12 prose-h2:text-3xl prose-h3:text-2xl prose-p:leading-8 prose-a:text-blue-600 prose-pre:rounded-xl prose-pre:border prose-pre:border-white/10 prose-pre:bg-slate-950"
					dangerouslySetInnerHTML={{ __html: post.content || "" }}
				/>
			</article>
		</main>
	);
}
