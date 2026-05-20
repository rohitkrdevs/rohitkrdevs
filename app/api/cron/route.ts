import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseStringPromise } from "xml2js";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const GOOGLE_TRENDS_RSS = "https://trends.google.com/trending/rss?geo=IN";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);

	if (searchParams.get("secret") !== process.env.CRON_SECRET) {
		return new NextResponse("Unauthorized Attempt Blocked", { status: 401 });
	}

	try {
		// 1. Fetch current trending feeds
		const rssResponse = await fetch(GOOGLE_TRENDS_RSS, { cache: "no-store" });
		const xmlData = await rssResponse.text();
		const parsedFeed = await parseStringPromise(xmlData);
		const topTrend = parsedFeed?.rss?.channel?.[0]?.item?.[0];

		if (!topTrend) {
			return NextResponse.json({ message: "No trending keywords discovered." });
		}

		const keyword = topTrend.title[0];
		const slug = keyword
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "");

		// 2. Prevent duplication bugs
		const { data: existingPost } = await supabase
			.from("blogs")
			.select("id")
			.eq("slug", slug)
			.maybeSingle();

		if (existingPost) {
			return NextResponse.json({
				message: `Keyword alignment checked: '${keyword}' already processed.`,
			});
		}

		// 3. Command high-performance technical content production
		const prompt = `Write a deep-dive, professional technical blog post analyzing the real-world impact of the topic: "${keyword}".
    Requirements:
    - Write it for experienced software developers and technology architects.
    - Provide deep technical insights and explanation context.
    - Structure your response explicitly as a valid JSON object with these keys: "title", "excerpt" (under 155 chars), "content" (pure semantic HTML strings using <p>, <h2>, <h3>, and <code> structures), "imageSearchTerm" (2-3 clean visual words like "software matrix abstract").`;

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
		const blogDraft = JSON.parse(aiData.choices[0].message.content);

		// 4. Build dynamic Unsplash optimization URLs
		const encodedTerm = encodeURIComponent(
			blogDraft.imageSearchTerm || "cyberpunk code technology",
		);
		const optimizedCoverUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80&sig=${Math.floor(Math.random() * 99999)}&q=${encodedTerm}`;

		// 5. Insert directly into Supabase database storage
		const { error: dbError } = await supabase.from("blogs").insert([
			{
				title: blogDraft.title,
				slug: slug,
				excerpt: blogDraft.excerpt,
				content: blogDraft.content,
				image_url: optimizedCoverUrl,
				trending_keyword: keyword,
				tags: [keyword.split(" ")[0] || "Tech", "Automation", "Trends"],
			},
		]);

		if (dbError) throw dbError;

		// 6. Instantly clear Next.js static asset caches
		revalidatePath("/");
		revalidatePath("/blog");

		return NextResponse.json({ success: true, topic: keyword });
		// src/app/api/cron/route.ts
	} catch (error: unknown) {
		// 👈 Change 'any' to 'unknown' to satisfy TypeScript rules
		const errorMessage =
			error instanceof Error
				? error.message
				: "An unknown database pipeline error occurred";

		console.error("Cron Process Interruption Exception:", error);
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
