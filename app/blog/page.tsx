import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, Calendar, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

// Initialize Supabase (Server-side)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function BlogPostPage({
	params,
}: {
	params: { slug: string };
}) {
	// 1. Fetch the specific blog post by its slug
	const { data: post, error } = await supabase
		.from("blogs")
		.select("*")
		.eq("slug", params.slug)
		.single();

	// 2. If it doesn't exist, show Next.js 404 page
	if (error || !post) {
		notFound();
	}

	return (
		<main className="min-h-screen bg-white dark:bg-zinc-950 pt-32 pb-20 px-4 transition-colors duration-300">
			<article className="container mx-auto max-w-3xl">
				{/* Back Button */}
				<Link
					href="/blog"
					className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors mb-12 group">
					<ArrowLeft
						size={16}
						className="transition-transform group-hover:-translate-x-1"
					/>
					Back to all articles
				</Link>

				{/* Article Header */}
				<header className="mb-12">
					<div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 mb-6">
						<span className="flex items-center gap-1.5">
							<Calendar size={16} />
							{new Date(post.published_at).toLocaleDateString("en-US", {
								month: "long",
								day: "numeric",
								year: "numeric",
							})}
						</span>
						<span className="flex items-center gap-1.5">
							<User size={16} />
							{post.author_name}
						</span>
						<div className="flex gap-2">
							{post.tags?.map((tag: string) => (
								<span
									key={tag}
									className="px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] uppercase tracking-wider font-semibold">
									{tag}
								</span>
							))}
						</div>
					</div>

					<h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6 leading-tight">
						{post.title}
					</h1>
				</header>

				{/* Hero Image */}
				{post.image_url && (
					<div className="w-full aspect-[21/9] rounded-2xl overflow-hidden mb-16 relative border border-black/5 dark:border-white/10">
						<Image
							src={post.image_url}
							alt={post.title}
							fill
							className="object-cover"
							priority
						/>
					</div>
				)}

				{/* AI-Generated HTML Content */}
				<div
					className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-12 prose-h3:text-2xl prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed prose-a:text-blue-500 prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl"
					dangerouslySetInnerHTML={{ __html: post.content }}
				/>
			</article>
		</main>
	);
}
