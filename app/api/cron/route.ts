import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Parser from "rss-parser";
import slugify from "slugify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const WIRED_RSS_URL = "https://www.wired.com/feed/rss";
const RSS_SCAN_LIMIT = 8;

const TECH_COVERS = [
	"https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
	"https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
	"https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
	"https://images.unsplash.com/photo-1555949963-aa79dcee57d5?auto=format&fit=crop&w=1200&q=80",
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

function buildPrompt({
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
	return `
You are a senior software architect writing for experienced engineers.

Source article:
- Title: ${JSON.stringify(title)}
- Summary: ${JSON.stringify(description)}
- Source URL: ${JSON.stringify(link)}
- Source author/creator: ${JSON.stringify(creator || "Unknown")}

Return one valid JSON object only. Do not wrap it in markdown fences. Do not add commentary.

The JSON object must contain exactly these keys:
{
  "title": "string",
  "excerpt": "string under 155 characters",
  "content": "semantic HTML string only",
  "headings": [{"level": 2, "id": "string", "text": "string"}],
  "seo_title": "string under 60 characters",
  "seo_description": "string under 155 characters",
  "seo_keywords": ["string"]
}

Content requirements:
- Write an original, production-quality technical blog post inspired by the source.
- Use pure semantic HTML blocks only: <p>, <h2 id="">, <h3 id="">, <ul>, <ol>, <li>, <pre><code>, <strong>, <em>, <blockquote>.
- Do not use markdown.
- Do not use raw <html>, <body>, <article>, <section>, <img>, <script>, inline styles, event handlers, or nested anchors.
- Escape code samples inside <code> with HTML entities where needed.
- Include 4 to 6 h2/h3 headings, each with a stable slug id.
- The headings array must match the h2/h3 elements in the content exactly.
`;
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

		const feed = await parser.parseURL(WIRED_RSS_URL);
		const candidates = feed.items
			.filter((item) => item.title && item.link)
			.slice(0, RSS_SCAN_LIMIT)
			.map((item) => ({
				item,
				slug: makeSlug(item.title ?? ""),
			}));

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

		const { item, slug } = nextCandidate;
		const sourceTitle = item.title ?? "Recent technology news";
		const sourceDescription =
			item.contentSnippet || item.content || item.summary || sourceTitle;
		const sourceCreator =
			item.creator || item.author || item["dc:creator"] || "";
		const prompt = buildPrompt({
			title: sourceTitle,
			description: textFromHtml(sourceDescription).slice(0, 1000),
			link: item.link ?? WIRED_RSS_URL,
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
		const coverIndex =
			Math.abs(slug.length + sourceTitle.length) % TECH_COVERS.length;

		const blogRow: BlogInsert = {
			...draft,
			slug,
			content_format: "html",
			canonical_url: `${origin}/blog/${slug}`,
			image_url: TECH_COVERS[coverIndex],
			tags: ["Tech News", "Engineering", "AI"],
			author_name: sourceCreator || "System Automation",
			author_avatar: null,
			status: "published",
			published_at: now,
			updated_at: now,
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
			source: WIRED_RSS_URL,
			post: insertedPost,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);

		console.error("Blog cron failed:", error);

		return jsonResponse({ error: message }, 500);
	}
}
