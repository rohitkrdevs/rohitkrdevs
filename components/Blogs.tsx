"use client";

import React, { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowUpRight, BookOpen, Calendar } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

interface BlogPost {
	id: number;
	title: string;
	excerpt: string;
	slug: string;
	image_url: string;
	published_at: string;
	tags: string[];
}

export default function Blogs() {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		async function fetchAutomatedArticles() {
			// 1. Get environment variables safely inside the effect
			const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
			const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

			// 2. Build-time/Missing Key Guard:
			// If keys aren't present, we just return empty state and stop here.
			if (
				!supabaseUrl ||
				!supabaseAnonKey ||
				supabaseUrl.includes("placeholder")
			) {
				setLoading(false);
				setPosts([]);
				return;
			}

			// 3. Initialize ONLY when we are sure keys exist (Client-side runtime)
			const supabase = createClient(supabaseUrl, supabaseAnonKey);

			try {
				const { data, error } = await supabase
					.from("blogs")
					.select("*")
					.order("published_at", { ascending: false })
					.limit(3);

				if (error) throw error;
				if (data) setPosts(data);
			} catch {
				setPosts([]);
			} finally {
				setLoading(false);
			}
		}
		fetchAutomatedArticles();
	}, []);

	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: { staggerChildren: 0.12 },
		},
	};

	const cardVariants: Variants = {
		hidden: { opacity: 0, y: 30 },
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
		<section id="blog" className="blog-section">
			<div className="blur-bg blog-glow-position" />

			<div className="container relative z-10 mx-auto px-4">
				<div className="blog-header-wrap">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
						className="max-w-xl">
						<p className="blog-label">Articles & Insights</p>
						<h3 className="blog-heading">Recent Technical Writings</h3>
						<p className="blog-subheading">
							Programmatic deep-dives driven by automated real-time engineering
							trends and search spikes.
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
						className="hidden md:block">
						<a href="/blog" className="blog-action-link">
							Explore all articles
							<ArrowUpRight size={16} className="blog-action-icon" />
						</a>
					</motion.div>
				</div>

				{loading ? (
					<div className="blog-grid">
						{[1, 2, 3].map((skeletonId) => (
							<div
								key={skeletonId}
								className="blog-card animate-pulse opacity-60">
								<div className="w-full h-48 rounded-xl bg-foreground/10 mb-4" />
								<div className="w-24 h-4 bg-foreground/10 rounded mb-4" />
								<div className="w-full h-6 bg-foreground/10 rounded mb-2" />
								<div className="w-3/4 h-6 bg-foreground/10 rounded mb-4" />
								<div className="w-full h-12 bg-foreground/5 rounded mt-auto" />
							</div>
						))}
					</div>
				) : (
					<motion.div
						className="blog-grid"
						variants={containerVariants}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, amount: 0.1 }}>
						{posts.map((post) => (
							<motion.article
								key={post.id}
								variants={cardVariants}
								whileHover={{ y: -6 }}
								className="blog-card group">
								<div className="relative z-10 flex flex-col h-full">
									<div className="w-full h-48 rounded-xl overflow-hidden mb-4 border border-foreground/5 bg-muted/20 relative">
										<Image
											src={post.image_url}
											alt={post.title}
											fill
											sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
											className="object-cover select-none pointer-events-none transition-transform duration-500 group-hover:scale-105"
											loading="lazy"
										/>
									</div>

									<div className="blog-meta-bar">
										<span className="blog-meta-item">
											<Calendar size={12} />
											{new Date(post.published_at).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											})}
										</span>
									</div>

									<h4 className="blog-card-title">
										<a
											href={`/blog/${post.slug}`}
											className="focus:outline-none hover:text-blue-500 transition-colors">
											{post.title}
										</a>
									</h4>

									<p className="blog-card-desc line-clamp-3">{post.excerpt}</p>

									<div className="blog-card-footer mt-auto">
										<div className="blog-tags-wrap">
											{post.tags?.map((tag) => (
												<span key={tag} className="blog-tag">
													{tag}
												</span>
											))}
										</div>
										<BookOpen size={15} className="blog-footer-icon" />
									</div>
								</div>
							</motion.article>
						))}
					</motion.div>
				)}

				{!loading && posts.length === 0 && (
					<div className="text-center py-12 border border-dashed border-foreground/10 rounded-2xl bg-background/20 backdrop-blur-sm">
						<BookOpen
							size={32}
							className="mx-auto text-muted-foreground opacity-40 mb-3"
						/>
						<p className="text-sm text-muted-foreground">
							The daily automation scheduler is compiling today&apos;s breakout
							articles. Check back shortly!
						</p>
					</div>
				)}

				<div className="blog-mobile-action-wrap">
					<a href="/blog" className="blog-mobile-btn">
						Explore all articles
						<ArrowUpRight size={16} />
					</a>
				</div>
			</div>
		</section>
	);
}
