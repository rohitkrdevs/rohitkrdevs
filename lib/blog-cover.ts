type BlogCoverInput = {
	title: string;
	tags?: readonly string[] | null;
	keywords?: readonly string[] | null;
	sourceLabel?: string | null;
	seed?: string | null;
	imageUrl?: string | null;
};

const LEGACY_STOCK_HOSTS = ["images.unsplash.com"];

const PALETTES = [
	["#0f172a", "#2563eb", "#38bdf8", "#f8fafc"],
	["#111827", "#7c3aed", "#22d3ee", "#f9fafb"],
	["#052e2b", "#0f766e", "#5eead4", "#f0fdfa"],
	["#1f2937", "#ea580c", "#facc15", "#fff7ed"],
	["#18181b", "#16a34a", "#86efac", "#f7fee7"],
	["#172554", "#4f46e5", "#a5b4fc", "#eef2ff"],
];

function hashString(value: string): number {
	let hash = 0;

	for (let index = 0; index < value.length; index += 1) {
		hash = (hash << 5) - hash + value.charCodeAt(index);
		hash |= 0;
	}

	return Math.abs(hash);
}

function escapeXml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function wrapText(
	value: string,
	maxLineLength: number,
	maxLines: number,
): string[] {
	const words = value.replace(/\s+/g, " ").trim().split(" ");
	const lines: string[] = [];
	let currentLine = "";

	for (const word of words) {
		const candidate = currentLine ? `${currentLine} ${word}` : word;

		if (candidate.length > maxLineLength && currentLine) {
			lines.push(currentLine);
			currentLine = word;
		} else {
			currentLine = candidate;
		}

		if (lines.length === maxLines) {
			break;
		}
	}

	if (currentLine && lines.length < maxLines) {
		lines.push(currentLine);
	}

	if (
		lines.length === maxLines &&
		words.join(" ").length > lines.join(" ").length
	) {
		lines[maxLines - 1] =
			`${lines[maxLines - 1].replace(/[.,;:!?-]*$/, "")}...`;
	}

	return lines.length ? lines : ["Engineering Notes"];
}

function isLegacyStockCoverUrl(imageUrl: string): boolean {
	try {
		const url = new URL(imageUrl);

		return LEGACY_STOCK_HOSTS.some((host) => url.hostname === host);
	} catch {
		return false;
	}
}

function createPattern(
	seed: number,
	accent: string,
	highlight: string,
): string {
	const nodes = Array.from({ length: 9 }, (_, index) => {
		const x = 660 + ((seed + index * 97) % 430);
		const y = 86 + ((seed + index * 53) % 480);
		const radius = 16 + ((seed + index * 17) % 42);
		const opacity = 0.16 + ((seed + index * 11) % 30) / 100;
		const color = index % 3 === 0 ? highlight : accent;

		return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" opacity="${opacity.toFixed(
			2,
		)}" />`;
	}).join("");

	const lines = Array.from({ length: 8 }, (_, index) => {
		const y = 120 + index * 54;
		const x2 = 1040 - ((seed + index * 37) % 180);

		return `<path d="M620 ${y} C730 ${y - 42}, 840 ${y + 42}, ${x2} ${y}" stroke="${highlight}" stroke-width="2" opacity="0.18" fill="none" />`;
	}).join("");

	return `${lines}${nodes}`;
}

export function createBlogCoverDataUrl({
	title,
	tags,
	keywords,
	sourceLabel,
	seed,
}: BlogCoverInput): string {
	const safeTitle = title || "Engineering Notes";
	const topic = tags?.[0] || keywords?.[0] || "Software Engineering";
	const descriptor = [sourceLabel, ...(keywords ?? [])]
		.filter(Boolean)
		.slice(0, 3)
		.join(" / ");
	const hash = hashString(`${seed || safeTitle}:${topic}:${descriptor}`);
	const [bg, accent, highlight, foreground] = PALETTES[hash % PALETTES.length];
	const titleLines = wrapText(safeTitle, 34, 3);
	const titleSvg = titleLines
		.map(
			(line, index) =>
				`<text x="72" y="${244 + index * 58}" fill="${foreground}" font-family="Inter, Arial, sans-serif" font-size="44" font-weight="600" letter-spacing="-1">${escapeXml(
					line,
				)}</text>`,
		)
		.join("");

	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${escapeXml(safeTitle)}">
<defs>
    <!-- Deep, immersive background gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg}" />
        <stop offset="100%" stop-color="${bg}" stop-opacity="0.95" />
    </linearGradient>

    <!-- Ultra-soft blur filter for modern mesh gradients -->
    <filter id="ambientBlur" x="-30%" y="-30%" width="160%" height="160%" filterUnits="userSpaceOnUse">
        <feGaussianBlur stdDeviation="130" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
</defs>

<!-- Base Background Layer -->
<rect width="1200" height="630" fill="url(#bgGrad)" />

<!-- Organic, Borderless Mesh Glows -->
<g filter="url(#ambientBlur)">
    <circle cx="1150" cy="80" r="450" fill="${accent}" opacity="0.25" />
    <circle cx="50" cy="580" r="500" fill="${highlight}" opacity="0.15" />
    <circle cx="600" cy="315" r="300" fill="${accent}" opacity="0.05" />
</g>

<!-- Subtle Tech/Data Grid Texture -->
<path d="M 0,100 L 1200,100 M 0,200 L 1200,200 M 0,300 L 1200,300 M 0,400 L 1200,400 M 0,500 L 1200,500" stroke="${foreground}" stroke-width="1" opacity="0.02" />
<path d="M 200,0 L 200,630 M 400,0 L 400,630 M 600,0 L 600,630 M 800,0 L 800,630 M 1000,0 L 1000,630" stroke="${foreground}" stroke-width="1" opacity="0.02" />

<!-- Dynamic Pattern Injection -->
${createPattern(hash, accent, highlight)}

<!-- Top Meta Tag (Shifted slightly left to look natural with raw text layouts) -->
<g transform="translate(72, 90)">
    <circle cx="0" cy="-5" r="4" fill="${accent}" />
    <text x="18" y="1" fill="${foreground}" opacity="0.8" font-family="Inter, -apple-system, system-ui, sans-serif" font-size="14" font-weight="700" letter-spacing="0.25em">${escapeXml(topic.toUpperCase())}</text>
</g>

<!-- Primary Title Injection (Restored to flat injection so internal coordinates rule) -->
${titleSvg}

<!-- Minimalist Footer Line and Branding -->
<g transform="translate(72, 540)">
    <!-- Thin, clean divider line spanning across the canvas -->
    <line x1="0" y1="-35" x2="1056" y2="-35" stroke="${foreground}" stroke-width="1" opacity="0.08" />

    <!-- Subtitle / Context descriptor -->
    <text x="0" y="5" fill="${foreground}" opacity="0.6" font-family="Inter, -apple-system, system-ui, sans-serif" font-size="18" font-weight="500">${escapeXml(descriptor || "Original generated cover")}</text>
    
    <!-- Signature Branding (Right Aligned) -->
    <text x="1056" y="5" text-anchor="end" fill="${foreground}" opacity="0.4" font-family="Inter, -apple-system, system-ui, sans-serif" font-size="14" font-weight="700" letter-spacing="0.2em">ROHIT KUMAR</text>
</g>
</svg>`;

	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function resolveBlogCoverUrl(input: BlogCoverInput): string {
	if (input.imageUrl && !isLegacyStockCoverUrl(input.imageUrl)) {
		return input.imageUrl;
	}

	return createBlogCoverDataUrl(input);
}

export function shouldUnoptimizeBlogCover(imageUrl: string): boolean {
	return imageUrl.startsWith("data:");
}
