import { resolveBlogCoverUrl } from "./blog-cover";
import fs from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), "lib", "medium-cache.json");
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes in-memory cache

export interface MediumPost {
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

function extractFirstImage(html: string): string | null {
	if (!html) return null;
	const match = html.match(/<img[^>]+src="([^">]+)"/i);
	return match ? match[1] : null;
}

function extractExcerpt(html: string, maxLength: number = 160): string {
	if (!html) return "";
	// Strip HTML tags and normalize spacing
	const cleanText = html
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();

	if (cleanText.length <= maxLength) {
		return cleanText;
	}
	return cleanText.slice(0, maxLength) + "...";
}

function stripFirstImage(html: string, imageUrl: string | null): string {
	if (!html || !imageUrl) return html;
	const escapedUrl = imageUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
	// Matches <figure>...</figure> containing the image URL
	const figureRegex = new RegExp(`<figure[^>]*>\\s*<img[^>]+src="${escapedUrl}"[^>]*>([\\s\\S]*?)<\\/figure>`, "i");
	if (figureRegex.test(html)) {
		return html.replace(figureRegex, "");
	}
	// Matches raw <img> tag if not in a figure
	const imgRegex = new RegExp(`<img[^>]+src="${escapedUrl}"[^>]*>`, "i");
	return html.replace(imgRegex, "");
}

function cleanCDATA(str: string): string {
	if (!str) return "";
	return str.replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/i, "$1").trim();
}

function getTagValue(itemText: string, tag: string): string {
	const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
	const m = itemText.match(regex);
	return m ? cleanCDATA(m[1]) : "";
}

function getCategories(itemText: string): string[] {
	const categories: string[] = [];
	const catRegex = /<category[^>]*>([\s\S]*?)<\/category>/gi;
	let catMatch;
	while ((catMatch = catRegex.exec(itemText)) !== null) {
		categories.push(cleanCDATA(catMatch[1]));
	}
	return categories;
}

export async function getMediumBlogs(username?: string): Promise<MediumPost[]> {
	const user = username || process.env.NEXT_PUBLIC_MEDIUM_USERNAME || "rohitkrdevs";
	const feedUrl = `https://medium.com/feed/@${user.replace(/^@/, "")}`;

	// 1. Try to read from filesystem cache first
	try {
		if (fs.existsSync(CACHE_FILE)) {
			const stats = fs.statSync(CACHE_FILE);
			const age = Date.now() - stats.mtimeMs;

			if (age < CACHE_DURATION_MS) {
				const cacheData = fs.readFileSync(CACHE_FILE, "utf-8");
				const posts = JSON.parse(cacheData);
				if (Array.isArray(posts) && posts.length > 0) {
					console.log(`[Medium Cache] Using cached blogs (age: ${Math.round(age / 1000)}s)`);
					return posts;
				}
			}
		}
	} catch (cacheError) {
		console.warn("[Medium Cache] Failed to read cache file:", cacheError);
	}

	// 2. Cache is expired or missing. Fetch fresh copy from Medium RSS
	console.log(`[Medium Fetch] Fetching fresh blogs from RSS feed: ${feedUrl}`);
	try {
		const res = await fetch(feedUrl, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
				Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
				"Accept-Language": "en-US,en;q=0.5",
				Connection: "keep-alive",
			},
		});

		if (!res.ok) {
			throw new Error(`HTTP error! status: ${res.status}`);
		}

		const xml = await res.text();
		
		const posts: MediumPost[] = [];
		const itemRegex = /<item>([\s\S]*?)<\/item>/g;
		let match;
		let index = 0;

		while ((match = itemRegex.exec(xml)) !== null) {
			const itemText = match[1];
			const title = getTagValue(itemText, "title") || "Untitled Article";
			const link = getTagValue(itemText, "link") || `https://medium.com/@${user}`;
			const pubDate = getTagValue(itemText, "pubDate") || new Date().toISOString();
			const content = getTagValue(itemText, "content:encoded") || getTagValue(itemText, "content") || "";
			const coverUrlFromFeed = extractFirstImage(content);

			const tags = getCategories(itemText);
			const author = getTagValue(itemText, "dc:creator") || getTagValue(itemText, "creator") || "Rohit Kumar";
			const guid = getTagValue(itemText, "guid");
			const slug = link.split("/").pop()?.split("?")[0] || `post-${index}`;

			const coverUrl = resolveBlogCoverUrl({
				imageUrl: coverUrlFromFeed,
				title,
				tags,
				seed: slug,
			});

			const excerpt = extractExcerpt(content);
			const cleanedContent = stripFirstImage(content, coverUrlFromFeed);

			posts.push({
				id: guid || slug || String(index),
				title,
				link,
				pubDate,
				excerpt,
				coverUrl,
				tags,
				author,
				content: cleanedContent,
				slug,
			});
			index++;
		}

		// Save successfully fetched data to local JSON cache
		try {
			fs.writeFileSync(CACHE_FILE, JSON.stringify(posts, null, 2), "utf-8");
			console.log("[Medium Cache] Successfully saved fresh blogs to cache file");
		} catch (writeError) {
			console.warn("[Medium Cache] Failed to write cache file:", writeError);
		}

		return posts;
	} catch (error) {
		console.error("Error fetching Medium RSS feed:", error);
		
		// 3. Fallback: If fetch fails, return the expired cache as fallback instead of returning empty array
		try {
			if (fs.existsSync(CACHE_FILE)) {
				const cacheData = fs.readFileSync(CACHE_FILE, "utf-8");
				const posts = JSON.parse(cacheData);
				if (Array.isArray(posts) && posts.length > 0) {
					console.warn("[Medium Cache] Returning expired cache as fallback");
					return posts;
				}
			}
		} catch (fallbackError) {
			console.error("[Medium Cache] Failed to load fallback cache:", fallbackError);
		}

		return [];
	}
}
