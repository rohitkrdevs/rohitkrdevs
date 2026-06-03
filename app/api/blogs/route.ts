import { NextResponse } from "next/server";
import { getMediumBlogs } from "@/lib/medium";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const posts = await getMediumBlogs();

		return NextResponse.json(posts, {
			headers: {
				"Cache-Control": "public, s-maxage=900, stale-while-revalidate=600",
			},
		});
	} catch (error) {
		console.error("Failed to fetch Medium blogs in API route:", error);
		return NextResponse.json(
			{ error: "Failed to fetch blogs" },
			{ status: 500 },
		);
	}
}
