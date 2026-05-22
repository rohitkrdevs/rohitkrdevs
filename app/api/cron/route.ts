import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Parser from "rss-parser";
import slugify from "slugify";
import { createBlogCoverDataUrl } from "@/lib/blog-cover";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const RSS_ITEMS_PER_FEED = 3;
const MAX_CANDIDATES = 36;

type RssSource = {
	label: string;
	url: string;
	tags: string[];
};

const RSS_SOURCES: RssSource[] = [
	{
		label: "DEV Community Web Development",
		url: "https://dev.to/feed/tag/webdev",
		tags: ["Web Development", "Frontend", "DEV"],
	},
	{
		label: "DEV Community React",
		url: "https://dev.to/feed/tag/react",
		tags: ["React", "Frontend", "JavaScript"],
	},
	{
		label: "Hashnode Frontend",
		url: "https://hashnode.com/n/frontend/rss",
		tags: ["Frontend", "Web Development", "Hashnode"],
	},
	{
		label: "Smashing Magazine",
		url: "https://www.smashingmagazine.com/feed/",
		tags: ["Frontend", "UX", "Web Design"],
	},
	{
		label: "InfoQ Architecture & Design",
		url: "https://feed.infoq.com/architecture-design",
		tags: ["Architecture", "Software Design", "InfoQ"],
	},
	{
		label: "InfoQ Development",
		url: "https://feed.infoq.com/development",
		tags: ["Software Engineering", "Backend", "InfoQ"],
	},
	{
		label: "DEV Community Backend",
		url: "https://dev.to/feed/tag/backend",
		tags: ["Backend", "APIs", "DEV"],
	},
	{
		label: "DZone Database",
		url: "http://feeds.dzone.com/database",
		tags: ["Database", "Backend", "DZone"],
	},
	{
		label: "DEV Community TypeScript",
		url: "https://dev.to/feed/tag/typescript",
		tags: ["TypeScript", "JavaScript", "DEV"],
	},
	{
		label: "Hashnode Programming",
		url: "https://hashnode.com/n/programming/rss",
		tags: ["Programming", "Software Engineering", "Hashnode"],
	},
	{
		label: "SitePoint JavaScript",
		url: "https://www.sitepoint.com/javascript/feed/",
		tags: ["JavaScript", "Frontend", "SitePoint"],
	},
	{
		label: "Hacker News Front Page",
		url: "https://hnrss.org/frontpage",
		tags: ["Programming", "Technology", "Hacker News"],
	},
	{
		label: "InfoQ AI, ML & Data Engineering",
		url: "https://feed.infoq.com/ai-ml-data-eng",
		tags: ["AI", "Machine Learning", "Data Engineering"],
	},
	{
		label: "Wired Technology",
		url: "https://www.wired.com/feed/category/gear/latest/rss",
		tags: ["Technology", "Gear", "Wired"],
	},
	{
		label: "TechRadar Tech News",
		url: "https://www.techradar.com/rss",
		tags: ["Technology", "Tech News", "TechRadar"],
	},
	{
		label: "The Verge Tech",
		url: "https://www.theverge.com/rss/index.xml",
		tags: ["Technology", "Tech News", "The Verge"],
	},
	{
		label: "DEV Community Career",
		url: "https://dev.to/feed/tag/career",
		tags: ["Career", "Software Careers", "DEV"],
	},
	{
		label: "InfoQ Culture & Methods",
		url: "https://feed.infoq.com/culture-methods",
		tags: ["DevEx", "Leadership", "Engineering Culture"],
	},
	{
		label: "Hacker News Jobs",
		url: "https://hnrss.org/jobs",
		tags: ["Career", "Jobs", "Hacker News"],
	},
];

type RssFeedFields = {
	lastBuildDate?: string;
};

type RssItemFields = {
	author?: string;
	creator?: string;
	"dc:creator"?: string;
	content?: string;
	contentSnippet?: string;
};

type RssCandidate = {
	item: RssItemFields & {
		title?: string;
		link?: string;
		summary?: string;
	};
	slug: string;
	source: RssSource;
};

type BlogHeading = {
	level: 2 | 3;
	id: string;
	text: string;
};

type BlogDraft = {
	title: string;
	excerpt: string;
	content: string;
	headings: BlogHeading[];
	seo_title: string;
	seo_description: string;
	seo_keywords: string[];
};

type BlogInsert = BlogDraft & {
	slug: string;
	content_format: "html";
	canonical_url: string;
	image_url: string;
	tags: string[];
	author_name: string;
	author_avatar: string | null;
	status: "published";
	published_at: string;
	updated_at: string;
	trending_keyword: string;
};

const parser = new Parser<RssFeedFields, RssItemFields>({
	timeout: 15000,
	headers: {
		// ✅ Disguise the bot as a standard Google Chrome browser
		"User-Agent":
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
		Accept:
			"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
		"Accept-Language": "en-US,en;q=0.5",
		Connection: "keep-alive",
	},
	customFields: {
		item: ["author", "creator", "dc:creator", "content", "contentSnippet"],
	},
});

async function collectRssCandidates(): Promise<RssCandidate[]> {
	const settledFeeds = await Promise.allSettled(
		RSS_SOURCES.map(async (source) => {
			const feed = await parser.parseURL(source.url);

			return feed.items
				.filter((item) => item.title && item.link)
				.slice(0, RSS_ITEMS_PER_FEED)
				.map((item) => ({
					item,
					slug: makeSlug(item.title ?? ""),
					source,
				}));
		}),
	);

	return settledFeeds
		.flatMap((result) => (result.status === "fulfilled" ? result.value : []))
		.slice(0, MAX_CANDIDATES);
}

function jsonResponse(
	body: Record<string, unknown>,
	status: number = 200,
): NextResponse {
	return NextResponse.json(body, { status });
}

function makeSlug(title: string): string {
	return (
		slugify(title, {
			lower: true,
			strict: true,
			trim: true,
		}) || `post-${Date.now()}`
	);
}

function siteOrigin(request: NextRequest): string {
	const configuredUrl =
		process.env.NEXT_PUBLIC_SITE_URL ||
		process.env.VERCEL_PROJECT_PRODUCTION_URL;

	if (configuredUrl) {
		return configuredUrl.startsWith("http")
			? configuredUrl.replace(/\/$/, "")
			: `https://${configuredUrl.replace(/\/$/, "")}`;
	}

	return new URL(request.url).origin;
}

function cleanJsonPayload(raw: string): string {
	const withoutFences = raw
		.trim()
		.replace(/^\uFEFF/, "")
		.replace(/^```(?:json)?\s*/i, "")
		.replace(/\s*```$/i, "")
		.trim();

	const firstBrace = withoutFences.indexOf("{");
	const lastBrace = withoutFences.lastIndexOf("}");

	if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
		throw new Error("Groq returned a response without a valid JSON object.");
	}

	return withoutFences.slice(firstBrace, lastBrace + 1);
}

function textFromHtml(value: string): string {
	return value
		.replace(/<[^>]*>/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

function sanitizeHtmlContent(rawHtml: string): string {
	const allowedTags = new Set([
		"a",
		"blockquote",
		"code",
		"em",
		"h2",
		"h3",
		"li",
		"ol",
		"p",
		"pre",
		"strong",
		"ul",
	]);

	return rawHtml
		.replace(/<!--[\s\S]*?-->/g, "")
		.replace(
			/<(script|style|iframe|object|embed|svg|math|link|meta)[\s\S]*?<\/\1>/gi,
			"",
		)
		.replace(/<[^>]+>/g, (tag) => {
			const tagMatch = tag.match(/^<\/?\s*([a-zA-Z0-9:-]+)/);
			const tagName = tagMatch?.[1]?.toLowerCase();

			if (!tagName || !allowedTags.has(tagName)) {
				return "";
			}

			if (tag.startsWith("</")) {
				return `</${tagName}>`;
			}

			if (tagName === "h2" || tagName === "h3") {
				const id = tag.match(/\sid=["']([^"']+)["']/i)?.[1];
				return id ? `<${tagName} id="${makeSlug(id)}">` : `<${tagName}>`;
			}

			if (tagName === "a") {
				const href = tag.match(/\shref=["']([^"']+)["']/i)?.[1] ?? "";
				const safeHref = /^(https?:\/\/|mailto:)/i.test(href) ? href : "";

				return safeHref
					? `<a href="${safeHref}" rel="nofollow noopener noreferrer">`
					: "<a>";
			}

			return `<${tagName}>`;
		})
		.replace(/\s(on\w+|style|srcdoc)=["'][^"']*["']/gi, "")
		.replace(/\s(href|src)=["']\s*(javascript:|data:)[^"']*["']/gi, "");
}

function normalizeContentAndHeadings(rawContent: string): {
	content: string;
	headings: BlogHeading[];
} {
	const headings: BlogHeading[] = [];
	const sanitized = sanitizeHtmlContent(rawContent);

	const content = sanitized.replace(
		/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
		(match, levelValue: string, attrs: string, innerHtml: string) => {
			const text = textFromHtml(innerHtml);

			if (!text) {
				return match;
			}

			const existingId = attrs.match(/\sid=["']([^"']+)["']/i)?.[1];
			const id = makeSlug(existingId || text);
			const level = Number(levelValue) === 3 ? 3 : 2;

			headings.push({ level, id, text });

			return `<h${level} id="${id}">${innerHtml}</h${level}>`;
		},
	);

	return { content, headings };
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseBlogDraft(rawJson: string): BlogDraft {
	const parsed: unknown = JSON.parse(cleanJsonPayload(rawJson));

	if (!isRecord(parsed)) {
		throw new Error("Groq JSON response was not an object.");
	}

	const title = typeof parsed.title === "string" ? parsed.title.trim() : "";
	const excerpt =
		typeof parsed.excerpt === "string" ? parsed.excerpt.trim() : "";
	const rawContent =
		typeof parsed.content === "string" ? parsed.content.trim() : "";
	const seoTitle =
		typeof parsed.seo_title === "string" ? parsed.seo_title.trim() : title;
	const seoDescription =
		typeof parsed.seo_description === "string"
			? parsed.seo_description.trim()
			: excerpt;
	const seoKeywords = Array.isArray(parsed.seo_keywords)
		? parsed.seo_keywords
				.filter((keyword): keyword is string => typeof keyword === "string")
				.map((keyword) => keyword.trim())
				.filter(Boolean)
				.slice(0, 8)
		: [];

	if (!title || !excerpt || !rawContent) {
		throw new Error(
			"Groq JSON response is missing title, excerpt, or content.",
		);
	}

	const normalized = normalizeContentAndHeadings(rawContent);

	if (!normalized.content || normalized.headings.length === 0) {
		throw new Error("Groq content did not include valid h2/h3 HTML headings.");
	}

	return {
		title: title.slice(0, 180),
		excerpt: excerpt.slice(0, 220),
		content: normalized.content,
		headings: normalized.headings.slice(0, 8),
		seo_title: seoTitle.slice(0, 70),
		seo_description: seoDescription.slice(0, 170),
		seo_keywords: seoKeywords.length
			? seoKeywords
			: ["technology news", "software engineering", "ai infrastructure"],
	};
}

export function buildPrompt({
	title,
	description,
	link,
	creator,
}: {
	title: string;
	description: string;
	link: string;
	creator: string;
}): string {
	return `You are a Principal Software Architect and Technical Writer crafting a deep-dive engineering blog post for an audience of seasoned backend, systems, and architecture engineers (similar to the standard of the Netflix Tech Blog, Stripe Engineering, or Cloudflare Blog).

Source Context:
- Title: ${JSON.stringify(title)}
- Summary: ${JSON.stringify(description)}
- Source URL: ${JSON.stringify(link)}
- Source author/creator: ${JSON.stringify(creator || "Unknown")}

Task: Synthesize the provided source into an original, production-quality technical article. Do not merely summarize the source. Instead, use it as a springboard to discuss architectural patterns, trade-offs, performance implications, scalability constraints, and implementation details.

Output Requirements:
Return ONE valid JSON object only. Do not wrap it in markdown fences. Do not add conversational filler, preambles, or commentary before or after the JSON.

The JSON object must contain exactly these keys:
{
  "title": "string (A compelling, technically accurate title)",
  "excerpt": "string (Under 155 characters, summarizing the core technical value proposition)",
  "content": "string (Semantic HTML only, approx 1000-1500 words)",
  "headings": [{"level": 2, "id": "string", "text": "string"}],
  "seo_title": "string (Under 60 characters, optimized for technical search intent)",
  "seo_description": "string (Under 155 characters)",
  "seo_keywords": ["string", "string", "string"],
  "reading_time_minutes": 5
}

Content & Tone Guidelines:
- Tone: Objective, highly technical, pragmatic, and analytical. Avoid marketing fluff, hyperbole, and introductory filler. 
- Structure: Include a clear introduction (the "why"), a deep dive into the architecture or core concepts, real-world implementation challenges, an objective analysis of trade-offs/edge cases, and a definitive conclusion.
- Code & Configurations: Include realistic, production-like code snippets, configuration files, or data schemas where relevant to illustrate the concepts.

HTML Formatting Rules:
- Use pure semantic HTML string format for the "content" value.
- ABSOLUTELY NO MARKDOWN. Use HTML tags only.
- Permitted tags: <p>, <h2 id="">, <h3 id="">, <ul>, <ol>, <li>, <pre><code class="language-[type]">, <strong>, <em>, <blockquote>.
- Every <h2> and <h3> must contain a URL-safe, kebab-case 'id' attribute that perfectly matches the 'id' in the headings array.
- Escape code samples inside <code> with appropriate HTML entities (e.g., &lt;, &gt;, &amp;).
- Do not use raw <html>, <body>, <article>, <section>, <img>, <script>, inline styles, event handlers, or nested anchors.
- Ensure the HTML is properly formatted within the JSON string (escape quotes as necessary).

Validation:
The "headings" array must strictly match the exact text, level (2 or 3), and id of the <h2> and <h3> elements generated in the "content" string.`;
}

export async function GET(request: NextRequest) {
	const secret = request.nextUrl.searchParams.get("secret");

	if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
		return jsonResponse({ error: "Unauthorized" }, 401);
	}

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	const groqApiKey = process.env.GROQ_API_KEY;

	if (!supabaseUrl || !supabaseServiceKey || !groqApiKey) {
		return jsonResponse(
			{
				error:
					"Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or GROQ_API_KEY.",
			},
			500,
		);
	}

	try {
		const supabase = createClient(supabaseUrl, supabaseServiceKey, {
			auth: {
				persistSession: false,
				autoRefreshToken: false,
			},
		});

		const candidates = await collectRssCandidates();

		if (candidates.length === 0) {
			return jsonResponse({ message: "No usable RSS items were found." });
		}

		const { data: existingRows, error: lookupError } = await supabase
			.from("blogs")
			.select("slug")
			.in(
				"slug",
				candidates.map((candidate) => candidate.slug),
			);

		if (lookupError) {
			throw lookupError;
		}

		const existingSlugs = new Set(
			(existingRows ?? [])
				.map((row) =>
					isRecord(row) && typeof row.slug === "string" ? row.slug : "",
				)
				.filter(Boolean),
		);

		const nextCandidate = candidates.find(
			(candidate) => !existingSlugs.has(candidate.slug),
		);

		if (!nextCandidate) {
			return jsonResponse({
				message: "All recent RSS items have already been processed.",
			});
		}

		const { item, slug, source } = nextCandidate;
		const sourceTitle = item.title ?? "Recent technology news";
		const sourceDescription =
			item.contentSnippet || item.content || item.summary || sourceTitle;
		const sourceCreator =
			item.creator || item.author || item["dc:creator"] || "";
		const prompt = buildPrompt({
			title: sourceTitle,
			description: textFromHtml(sourceDescription).slice(0, 1000),
			link: item.link ?? source.url,
			creator: sourceCreator,
		});

		const groqResponse = await fetch(
			"https://api.groq.com/openai/v1/chat/completions",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${groqApiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: "llama-3.1-8b-instant",
					response_format: { type: "json_object" },
					temperature: 0.35,
					max_tokens: 3600,
					messages: [
						{
							role: "system",
							content:
								"You return strict JSON only. You never include markdown fences.",
						},
						{ role: "user", content: prompt },
					],
				}),
			},
		);

		if (!groqResponse.ok) {
			const errorText = await groqResponse.text();
			throw new Error(
				`Groq request failed: ${groqResponse.status} ${errorText}`,
			);
		}

		const groqData: unknown = await groqResponse.json();

		if (!isRecord(groqData) || !Array.isArray(groqData.choices)) {
			throw new Error("Groq response did not include choices.");
		}

		const firstChoice = groqData.choices[0];
		const rawContent =
			isRecord(firstChoice) &&
			isRecord(firstChoice.message) &&
			typeof firstChoice.message.content === "string"
				? firstChoice.message.content
				: "";

		if (!rawContent) {
			throw new Error("Groq response content was empty.");
		}

		const draft = parseBlogDraft(rawContent);
		const now = new Date().toISOString();
		const origin = siteOrigin(request);
		const imageUrl = createBlogCoverDataUrl({
			title: draft.title,
			tags: source.tags,
			keywords: draft.seo_keywords,
			sourceLabel: source.label,
			seed: slug,
		});

		const blogRow: BlogInsert = {
			...draft,
			slug,
			content_format: "html",
			canonical_url: `${origin}/blog/${slug}`,
			image_url: imageUrl,
			tags: source.tags,
			author_name: "Rohit Kumar",
			author_avatar: null,
			status: "published",
			published_at: now,
			updated_at: now,
			trending_keyword: draft.seo_keywords?.[0] || "Technology",
		};

		const { data: insertedPost, error: insertError } = await supabase
			.from("blogs")
			.insert(blogRow)
			.select("id, slug, title")
			.single();

		if (insertError) {
			if ("code" in insertError && insertError.code === "23505") {
				return jsonResponse({
					message: "A matching blog post was inserted by another run.",
					slug,
				});
			}

			throw insertError;
		}

		revalidatePath("/");
		revalidatePath("/blog");
		revalidatePath(`/blog/${slug}`);

		return jsonResponse({
			success: true,
			source: {
				label: source.label,
				url: source.url,
			},
			post: insertedPost,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);

		console.error("Blog cron failed:", error);

		return jsonResponse({ error: message }, 500);
	}
}
