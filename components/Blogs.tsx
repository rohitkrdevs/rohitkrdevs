"use client";

import React, { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowUpRight, BookOpen, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { shouldUnoptimizeBlogCover } from "@/lib/blog-cover";

interface MediumPost {
	id: string;
	title: string;
	link: string;
	pubDate: string;
	excerpt: string;
	coverUrl: string;
	tags: string[];
	author: string;
	content: string;
	slug: string;
}

export default function Blogs() {
	const [posts, setPosts] = useState<MediumPost[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		async function fetchMediumArticles() {
			try {
				const response = await fetch("/api/blogs");
				if (!response.ok) {
					throw new Error("Failed to fetch blogs from API");
				}
				const data = await response.json();
				if (Array.isArray(data)) {
					setPosts(data.slice(0, 3));
				}
			} catch (err) {
				console.error("Failed to load blog posts:", err);
				setPosts([]);
			} finally {
				setLoading(false);
			}
		}

		fetchMediumArticles();
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
						<h3 className="blog-heading">Recent Writings</h3>
						<p className="blog-subheading">
							Technical articles, engineering notes, and software architecture posts shared on Medium.
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
						className="hidden md:block">
						<Link href="/blog" className="blog-action-link">
							Explore all articles
							<ArrowUpRight size={16} className="blog-action-icon" />
						</Link>
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
						{posts.map((post) => {
							return (
								<motion.article
									key={post.id}
									variants={cardVariants}
									className="blog-card group">
									<div className="relative z-10 flex flex-col h-full">
										<div className="w-full h-48 rounded-xl overflow-hidden mb-4 border border-foreground/5 bg-muted/20 relative">
											<Image
												src={post.coverUrl}
												alt={post.title}
												fill
												unoptimized={shouldUnoptimizeBlogCover(post.coverUrl)}
												sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
												className="object-cover select-none pointer-events-none transition-transform duration-500 group-hover:scale-105"
												loading="lazy"
											/>
										</div>

										<div className="blog-meta-bar">
											<span className="blog-meta-item">
												<Calendar size={12} />
												{new Date(post.pubDate).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													year: "numeric",
												})}
											</span>
										</div>

										<h4 className="blog-card-title">
											<Link
												href={`/blog/${post.slug}`}
												className="hover:text-primary transition-colors duration-200">
												{post.title}
											</Link>
										</h4>

										<p className="blog-card-desc line-clamp-3">{post.excerpt}</p>

										<div className="blog-card-footer mt-auto">
											<div className="blog-tags-wrap">
												{post.tags?.slice(0, 3).map((tag) => (
													<span key={tag} className="blog-tag">
														{tag}
													</span>
												))}
											</div>
											<BookOpen size={15} className="blog-footer-icon" />
										</div>
									</div>
								</motion.article>
							);
						})}
					</motion.div>
				)}

				{!loading && posts.length === 0 && (
					<div className="text-center py-12 border border-dashed border-foreground/10 rounded-2xl bg-background/20 backdrop-blur-sm">
						<BookOpen
							size={32}
							className="mx-auto text-muted-foreground opacity-40 mb-3"
						/>
						<p className="text-sm text-muted-foreground">
							No articles found. Check back shortly!
						</p>
					</div>
				)}

				<div className="blog-mobile-action-wrap">
					<Link href="/blog" className="blog-mobile-btn">
						Explore all articles
						<ArrowUpRight size={16} />
					</Link>
				</div>
			</div>
		</section>
	);
}
