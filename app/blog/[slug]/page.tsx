import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, Calendar, User } from "lucide-react";

// Global components
import Footer from "@/components/Footer";
import GoToTopButton from "@/components/GoToTopButton";
import AIChatWidget from "@/components/AIChatWidget";
import ThemeToggle from "@/components/ThemeToggle";

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
		<main className="relative z-10 min-h-screen bg-background pt-12 text-foreground transition-colors duration-300 md:pt-32">
			<article className="container section article-main">
				<div className="blog-route-inner">
					{/* Back Button */}
					<Link href="/blog" className="article-back-link">
						<ArrowLeft size={16} />
						Back to articles
					</Link>

					{/* Hero Header */}
					<header className="article-header">
						<div className="article-meta">
							<span className="article-meta-item">
								<Calendar size={14} />
								{formatDate(publishedDate)}
							</span>
							<span className="article-meta-item">
								<User size={14} />
								{post.author_name || "System Automation"}
							</span>
						</div>

						<h1 className="article-title">{post.title}</h1>

						{post.excerpt && <p className="article-excerpt">{post.excerpt}</p>}

						{post.tags && post.tags.length > 0 && (
							<div className="article-tags">
								{post.tags.map((tag) => (
									<span key={tag} className="article-tag">
										{tag}
									</span>
								))}
							</div>
						)}
					</header>

					{/* Hero Image */}
					<div className="article-hero-img-wrap">
						<Image
							src={post.image_url || FALLBACK_IMAGE}
							alt={post.title}
							fill
							priority
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
							className="object-cover"
						/>
					</div>

					{/* Main Content (Powered entirely by the new CSS) */}
					<div
						className="article-content"
						dangerouslySetInnerHTML={{ __html: post.content || "" }}
					/>
				</div>
			</article>

			{/* Global Utility Components */}
			<div className="mt-auto relative z-20">
				<Footer />
			</div>

			<GoToTopButton />
			<AIChatWidget />
			<ThemeToggle />
		</main>
	);
}
