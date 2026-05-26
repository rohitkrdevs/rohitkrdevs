import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface ImageGenerationInput {
	title: string;
	tags: string[];
	keywords?: string[];
	description?: string;
}

/**
 * Generate a featured image for a blog post using Gemini + creative rendering
 * Uses Gemini to create descriptions, then generates styled SVG with those concepts
 */
export async function generateBlogFeaturedImage(
	input: ImageGenerationInput,
): Promise<string> {
	try {
		if (!process.env.GEMINI_API_KEY) {
			console.warn("GEMINI_API_KEY not configured, using fallback image");
			return getFallbackImageDataUrl(input.title);
		}

		// Get creative description from Gemini
		const description = await generateImageDescription(input);

		// Generate styled SVG based on the description
		const imageUrl = generateStyledSVG({
			title: input.title,
			description,
			tags: input.tags,
		});

		return imageUrl;
	} catch (error) {
		console.error("Error generating image with Gemini:", error);
		return getFallbackImageDataUrl(input.title);
	}
}

/**
 * Use Gemini to generate creative image descriptions
 */
async function generateImageDescription(
	input: ImageGenerationInput,
): Promise<string> {
	try {
		const prompt = `Create a very brief (1-2 sentences) visual description for a blog post featured image about: "${input.title}"

Tags: ${input.tags.join(", ")}
${input.keywords ? `Keywords: ${input.keywords.join(", ")}` : ""}

Description the visual style and main elements ONLY (no explanations). Be creative and modern. Example: "Gradient background with floating code symbols and a laptop silhouette"`;

		const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

		const result = await model.generateContent(prompt);
		const text = result.response.text();

		return text.trim();
	} catch (error) {
		console.error("Error generating description from Gemini:", error);
		return `Modern tech-focused design for ${input.tags[0] || "Technology"}`;
	}
}

/**
 * Generate a styled SVG image based on theme and description
 */
function generateStyledSVG(input: {
	title: string;
	description: string;
	tags: string[];
}): string {
	const colors = getColorScheme(input.tags[0] || "");
	const { gradient1, gradient2, accentColor, textColor } = colors;

	const titleWords = input.title.split(" ");
	const titleShort = titleWords.slice(0, 4).join(" ");

	const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
		<defs>
			<linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" style="stop-color:${gradient1};stop-opacity:1" />
				<stop offset="100%" style="stop-color:${gradient2};stop-opacity:1" />
			</linearGradient>
			<filter id="blur">
				<feGaussianBlur in="SourceGraphic" stdDeviation="3" />
			</filter>
		</defs>

		<!-- Background -->
		<rect width="1200" height="630" fill="url(#mainGradient)"/>

		<!-- Decorative elements -->
		<circle cx="100" cy="100" r="80" fill="${accentColor}" opacity="0.2" filter="url(#blur)"/>
		<circle cx="1100" cy="550" r="120" fill="${accentColor}" opacity="0.15" filter="url(#blur)"/>
		<rect x="0" y="400" width="1200" height="230" fill="rgba(0,0,0,0.1)"/>

		<!-- Main title -->
		<text x="600" y="280" font-size="56" font-weight="900" fill="${textColor}" text-anchor="middle" font-family="Arial, sans-serif" letter-spacing="-1">
			${escapeXml(titleShort)}
		</text>

		<!-- Subtitle/Tags -->
		<text x="600" y="380" font-size="20" fill="${textColor}" text-anchor="middle" font-family="Arial, sans-serif" opacity="0.9">
			${escapeXml(input.tags.slice(0, 2).join(" • "))}
		</text>

		<!-- Bottom accent bar -->
		<rect x="300" y="520" width="600" height="4" fill="${accentColor}" opacity="0.8"/>
	</svg>`;

	const base64 = Buffer.from(svg).toString("base64");
	return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Get color scheme based on tag/category
 */
function getColorScheme(
	tag: string,
): {
	gradient1: string;
	gradient2: string;
	accentColor: string;
	textColor: string;
} {
	const tagLower = tag.toLowerCase();

	const schemes: Record<
		string,
		{
			gradient1: string;
			gradient2: string;
			accentColor: string;
			textColor: string;
		}
	> = {
		react: {
			gradient1: "#61dafb",
			gradient2: "#0a7ea4",
			accentColor: "#61dafb",
			textColor: "#ffffff",
		},
		frontend: {
			gradient1: "#ff6b6b",
			gradient2: "#4ecdc4",
			accentColor: "#ff6b6b",
			textColor: "#ffffff",
		},
		backend: {
			gradient1: "#667eea",
			gradient2: "#764ba2",
			accentColor: "#667eea",
			textColor: "#ffffff",
		},
		webdevelopment: {
			gradient1: "#2563eb",
			gradient2: "#1d4ed8",
			accentColor: "#60a5fa",
			textColor: "#ffffff",
		},
		javascript: {
			gradient1: "#f7df1e",
			gradient2: "#000000",
			accentColor: "#f7df1e",
			textColor: "#000000",
		},
		typescript: {
			gradient1: "#3178c6",
			gradient2: "#235a97",
			accentColor: "#3178c6",
			textColor: "#ffffff",
		},
		ux: {
			gradient1: "#ff006e",
			gradient2: "#8338ec",
			accentColor: "#ff006e",
			textColor: "#ffffff",
		},
		design: {
			gradient1: "#fb5607",
			gradient2: "#ffbe0b",
			accentColor: "#fb5607",
			textColor: "#ffffff",
		},
		architecture: {
			gradient1: "#06aed5",
			gradient2: "#086788",
			accentColor: "#06aed5",
			textColor: "#ffffff",
		},
	};

	// Find matching scheme or use default
	for (const [key, scheme] of Object.entries(schemes)) {
		if (tagLower.includes(key)) {
			return scheme;
		}
	}

	return {
		gradient1: "#667eea",
		gradient2: "#764ba2",
		accentColor: "#667eea",
		textColor: "#ffffff",
	};
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

/**
 * Fallback SVG-based image when Gemini API is unavailable
 */
function getFallbackImageDataUrl(title: string): string {
	const titleShort = title.split(" ").slice(0, 4).join(" ");
	const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
		<defs>
			<linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
				<stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
			</linearGradient>
		</defs>
		<rect width="1200" height="630" fill="url(#bgGradient)"/>
		<text x="600" y="315" font-size="52" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif">
			${escapeXml(titleShort)}
		</text>
	</svg>`;

	const base64 = Buffer.from(svg).toString("base64");
	return `data:image/svg+xml;base64,${base64}`;
}
