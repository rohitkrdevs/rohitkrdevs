import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseStringPromise } from "xml2js";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

// 1. Updated to Wired's RSS Feed
const WIRED_RSS_URL = "https://www.wired.com/feed/rss";

const TECH_COVERS = [
	"https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
	"https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
	"https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
	"https://images.unsplash.com/photo-1555949963-aa79dcee57d5?auto=format&fit=crop&w=1200&q=80",
];

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);

	if (searchParams.get("secret") !== process.env.CRON_SECRET) {
		return new NextResponse("Unauthorized Attempt Blocked", { status: 401 });
	}

	try {
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

		if (!supabaseUrl || !supabaseServiceKey) {
			throw new Error(
				"Missing Supabase Service Role Key in environment variables.",
			);
		}

		const supabase = createClient(supabaseUrl, supabaseServiceKey);

		// 2. Fetch the Wired RSS feed
		const rssResponse = await fetch(WIRED_RSS_URL, { cache: "no-store" });
		const xmlData = await rssResponse.text();
		const parsedFeed = await parseStringPromise(xmlData);

		// Get the most recent article from the feed
		const topItem = parsedFeed?.rss?.channel?.[0]?.item?.[0];

		if (!topItem) {
			return NextResponse.json({
				message: "No articles found in the RSS feed.",
			});
		}

		// 3. Extract title and description for better AI context
		const articleTitle = topItem.title[0];
		const articleDesc = topItem.description?.[0] || "Recent technology news.";

		// Create a clean slug from the title
		const slug = articleTitle
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "");

		const { data: existingPost } = await supabase
			.from("blogs")
			.select("id")
			.eq("slug", slug)
			.maybeSingle();

		if (existingPost) {
			return NextResponse.json({
				message: `Article already processed: '${articleTitle}'.`,
			});
		}

		// 4. Upgraded Prompt: Passing both title and description to the AI
		const prompt = `Write a deep-dive, professional technical blog post expanding on this recent tech news.
        Topic: "${articleTitle}"
        Context: "${articleDesc}"
        
        Requirements:
        - Write it for experienced software developers and technology architects.
        - Provide deep technical insights and explanation context.
        - Structure your response EXPLICITLY as a valid JSON object. Do not include markdown formatting like \`\`\`json.
        
        The JSON object MUST have exactly these keys:
        - "title": (String) A catchy, professional title.
        - "excerpt": (String) A short summary under 155 chars.
        - "content": (String) Pure semantic HTML strings using <p>, <h2>, <h3>, <ul>, <li>, and <pre><code> structures.
        - "headings": (Array of Objects) Generate 3-5 table of contents items based on your content. Format: [{"level": 2, "id": "intro-id", "text": "Introduction text"}]. Ensure the IDs match the IDs of the <h2>/<h3> tags in your HTML content.
        - "seo_title": (String) Optimized title for Google search (under 60 chars).
        - "seo_description": (String) Meta description for search engines (under 155 chars).
        - "seo_keywords": (Array of Strings) 3-5 highly relevant technical SEO keywords.`;

		const aiResponse = await fetch(
			"https://api.groq.com/openai/v1/chat/completions",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
				},
				body: JSON.stringify({
					model: "llama-3.1-8b-instant",
					response_format: { type: "json_object" },
					messages: [{ role: "user", content: prompt }],
				}),
			},
		);

		const aiData = await aiResponse.json();

		let rawContent = aiData.choices[0].message.content.trim();
		if (rawContent.startsWith("```json")) {
			rawContent = rawContent.replace(/^```json\n/, "").replace(/\n```$/, "");
		}

		const blogDraft = JSON.parse(rawContent);

		const optimizedCoverUrl =
			TECH_COVERS[Math.floor(Math.random() * TECH_COVERS.length)];

		const { error: dbError } = await supabase.from("blogs").insert([
			{
				title: blogDraft.title,
				slug: slug,
				excerpt: blogDraft.excerpt,
				content: blogDraft.content,
				content_format: "html",
				headings: blogDraft.headings || null,
				image_url: optimizedCoverUrl,
				seo_title: blogDraft.seo_title || blogDraft.title,
				seo_description: blogDraft.seo_description || blogDraft.excerpt,
				seo_keywords: blogDraft.seo_keywords || [
					"Tech",
					"Engineering",
					"Wired",
				],
				canonical_url:
					topItem.link?.[0] ||
					`[https://yourwebsite.com/blog/$](https://yourwebsite.com/blog/$){slug}`,
				tags: ["Tech News", "Engineering", "Trends"],
				author_name: "Automated Systems",
				status: "published",
			},
		]);

		if (dbError) throw dbError;

		revalidatePath("/");
		revalidatePath("/blog");

		return NextResponse.json({ success: true, topic: articleTitle });
	} catch (error: unknown) {
		let errorMessage = "An unknown database pipeline error occurred";
		if (error instanceof Error) {
			errorMessage = error.message;
		} else if (typeof error === "object" && error !== null) {
			errorMessage = JSON.stringify(error);
		} else {
			errorMessage = String(error);
		}

		console.error("Cron Process Interruption Exception:", error);
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
