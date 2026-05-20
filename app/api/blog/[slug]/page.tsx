import React from "react";
import { createClient } from "@supabase/supabase-js";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image"; // 👈 Integrated high-performance Next.js Optimizer

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

interface Props {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const { data: post } = await supabase
		.from("blogs")
		.select("*")
		.eq("slug", slug)
		.maybeSingle();
	if (!post) return { title: "Article Not Found" };

	return {
		title: `${post.title} | Technical Blog`,
		description: post.excerpt,
		openGraph: {
			title: post.title,
			description: post.excerpt,
			type: "article",
		},
	};
}

export default async function BlogPostPage({ params }: Props) {
	const { slug } = await params;
	const { data: post } = await supabase
		.from("blogs")
		.select("*")
		.eq("slug", slug)
		.maybeSingle();

	if (!post) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground text-center p-4">
				<h1 className="text-3xl font-bold mb-4">Post not found</h1>
				<Link href="/" className="text-blue-500 hover:underline">
					Return Home
				</Link>
			</div>
		);
	}

	return (
		<article className="min-h-screen pt-32 pb-24 max-w-4xl mx-auto px-4 text-foreground">
			{/* ⚡ Next.js Image Component replacing standard raw unoptimized img tags */}
			<div className="w-full h-62.5 sm:h-100 relative rounded-2xl overflow-hidden mb-12 border border-foreground/10 shadow-lg">
				<Image
					src={post.image_url}
					alt={post.title}
					fill
					priority // 👈 Speeds up Core Web Vitals by preloading above-the-fold content
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
					className="object-cover select-none pointer-events-none"
				/>
			</div>

			<h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">
				{post.title}
			</h1>
			<div
				className="prose dark:prose-invert max-w-none space-y-6"
				dangerouslySetInnerHTML={{ __html: post.content }}
			/>
		</article>
	);
}
