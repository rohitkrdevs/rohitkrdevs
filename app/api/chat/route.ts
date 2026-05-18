type ChatRole = "user" | "assistant";

export const runtime = "nodejs";
export const maxDuration = 30;

type ChatMessage = {
	role: ChatRole;
	content: string;
};

const SYSTEM_PROMPT = `
You are Rohit Kumar's Gemini AI assistant on rohitkrdevs.com.
You can help visitors with Rohit's profile, portfolio, skills, projects, contact details, and general questions about technology, learning, coding, careers, current events, or anything else they ask.

Rohit's profile context:
- Rohit Kumar is a full stack developer based in Ranchi.
- He builds modern web applications with Next.js, React, TypeScript, Tailwind CSS, JavaScript, Node.js, Express.js, PHP, MySQL, MongoDB, WordPress, REST APIs, Git, responsive design, SEO, polished UI, and performance-focused frontend work.
- He works on admin dashboards, business systems, automation workflows, payment integrations, SEO-friendly websites, and scalable backend APIs.
- For contact or hiring questions, encourage visitors to use the contact form or email rohitkrdevs@gmail.com.

Style:
- Be warm, concise, and useful.
- For questions about Rohit, use the profile context above and do not invent private details, prices, guarantees, employment status, or project timelines.
- For general questions, answer normally and use web-grounded information when the question benefits from fresh or verifiable internet data.
- When internet sources are available, write answers that are easy to verify.
- Use concise Markdown. Use bullet lists when listing skills, tools, steps, or comparisons. Use bold only for short labels or important names.
`;

type ChatSource = {
	title: string;
	uri: string;
};

const GEMINI_TIMEOUT_MS = 20000;
const RETRY_DELAY_MS = 700;
const GEMINI_RETRY_ATTEMPTS = 3;

function isChatMessage(value: unknown): value is ChatMessage {
	if (!value || typeof value !== "object") return false;

	const message = value as Record<string, unknown>;

	return (
		(message.role === "user" || message.role === "assistant") &&
		typeof message.content === "string" &&
		message.content.trim().length > 0
	);
}

function getErrorMessage(payload: unknown) {
	if (!payload || typeof payload !== "object") {
		return "Gemini could not respond right now.";
	}

	const error = (payload as Record<string, unknown>).error;

	if (!error || typeof error !== "object") {
		return "Gemini could not respond right now.";
	}

	const message = (error as Record<string, unknown>).message;

	return typeof message === "string"
		? message
		: "Gemini could not respond right now.";
}

function getGeminiReply(payload: unknown) {
	if (!payload || typeof payload !== "object") return null;

	const candidates = (payload as Record<string, unknown>).candidates;

	if (!Array.isArray(candidates)) return null;

	const firstCandidate = candidates[0];

	if (!firstCandidate || typeof firstCandidate !== "object") return null;

	const content = (firstCandidate as Record<string, unknown>).content;

	if (!content || typeof content !== "object") return null;

	const parts = (content as Record<string, unknown>).parts;

	if (!Array.isArray(parts)) return null;

	const text = parts
		.map((part) =>
			part && typeof part === "object"
				? (part as Record<string, unknown>).text
				: null,
		)
		.filter((part): part is string => typeof part === "string")
		.join("")
		.trim();

	return text.length > 0 ? text : null;
}

function getGeminiSources(payload: unknown): ChatSource[] {
	if (!payload || typeof payload !== "object") return [];

	const candidates = (payload as Record<string, unknown>).candidates;

	if (!Array.isArray(candidates)) return [];

	const firstCandidate = candidates[0];

	if (!firstCandidate || typeof firstCandidate !== "object") return [];

	const groundingMetadata = (firstCandidate as Record<string, unknown>)
		.groundingMetadata;

	if (!groundingMetadata || typeof groundingMetadata !== "object") return [];

	const groundingChunks = (groundingMetadata as Record<string, unknown>)
		.groundingChunks;

	if (!Array.isArray(groundingChunks)) return [];

	const sourceMap = new Map<string, ChatSource>();

	for (const chunk of groundingChunks) {
		if (!chunk || typeof chunk !== "object") continue;

		const web = (chunk as Record<string, unknown>).web;

		if (!web || typeof web !== "object") continue;

		const uri = (web as Record<string, unknown>).uri;
		const title = (web as Record<string, unknown>).title;

		if (typeof uri !== "string" || uri.trim().length === 0) continue;

		sourceMap.set(uri, {
			uri,
			title:
				typeof title === "string" && title.trim().length > 0
					? title
					: new URL(uri).hostname,
		});
	}

	return Array.from(sourceMap.values()).slice(0, 4);
}

function shouldUseGoogleSearch(prompt: string) {
	return /\b(latest|current|today|now|recent|news|internet|web|search|google|live|update|price|weather|who is|what is happening)\b/i.test(
		prompt,
	);
}

function wait(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function createGeminiBody(messages: ChatMessage[], useGoogleSearch: boolean) {
	return {
		systemInstruction: {
			parts: [{ text: SYSTEM_PROMPT }],
		},
		contents: messages.map((message) => ({
			role: message.role === "assistant" ? "model" : "user",
			parts: [{ text: message.content }],
		})),
		...(useGoogleSearch
			? {
					tools: [
						{
							google_search: {},
						},
					],
				}
			: {}),
		generationConfig: {
			maxOutputTokens: 450,
			temperature: 0.7,
		},
	};
}

async function callGemini(
	endpoint: string,
	apiKey: string,
	messages: ChatMessage[],
	useGoogleSearch: boolean,
) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

	try {
		return await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-goog-api-key": apiKey,
			},
			signal: controller.signal,
			body: JSON.stringify(createGeminiBody(messages, useGoogleSearch)),
		});
	} finally {
		clearTimeout(timeout);
	}
}

async function callGeminiWithRetry(
	endpoint: string,
	apiKey: string,
	messages: ChatMessage[],
	useGoogleSearch: boolean,
) {
	let lastError: unknown;

	for (let attempt = 1; attempt <= GEMINI_RETRY_ATTEMPTS; attempt += 1) {
		try {
			return await callGemini(endpoint, apiKey, messages, useGoogleSearch);
		} catch (error) {
			lastError = error;

			if (attempt < GEMINI_RETRY_ATTEMPTS) {
				await wait(RETRY_DELAY_MS * attempt);
			}
		}
	}

	if (useGoogleSearch) {
		return await callGeminiWithRetry(endpoint, apiKey, messages, false);
	}

	throw lastError;
}

export async function POST(request: Request) {
	const apiKey = process.env.GEMINI_API_KEY;

	if (!apiKey) {
		return Response.json(
			{
				reply:
					"Gemini AI is almost ready. Add GEMINI_API_KEY to your environment and restart the dev server.",
			},
			{ status: 503 },
		);
	}

	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return Response.json({ error: "Invalid request body." }, { status: 400 });
	}

	const messagesValue =
		body && typeof body === "object"
			? (body as Record<string, unknown>).messages
			: null;

	if (!Array.isArray(messagesValue)) {
		return Response.json({ error: "Messages are required." }, { status: 400 });
	}

	const messages = messagesValue
		.filter(isChatMessage)
		.slice(-8)
		.map((message) => ({
			role: message.role,
			content: message.content.trim().slice(0, 1200),
		}));

	if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
		return Response.json(
			{ error: "Send a user message to start the chat." },
			{ status: 400 },
		);
	}

	const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
	const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
	const lastUserMessage = messages[messages.length - 1].content;
	const useGoogleSearch = shouldUseGoogleSearch(lastUserMessage);

	let response: Response;

	try {
		response = await callGeminiWithRetry(
			endpoint,
			apiKey,
			messages,
			useGoogleSearch,
		);
	} catch (error) {
		const isTimeout = error instanceof DOMException && error.name === "AbortError";

		return Response.json(
			{
				error: isTimeout
					? "Gemini took too long to respond. Please try again."
					: "Could not reach Gemini right now. Please check your internet connection and try again.",
			},
			{ status: 502 },
		);
	}

	const data: unknown = await response.json().catch(() => null);

	if (!response.ok) {
		if (useGoogleSearch && [400, 403, 429, 503].includes(response.status)) {
			const fallbackResponse = await callGemini(
				endpoint,
				apiKey,
				messages,
				false,
			);
			const fallbackData: unknown = await fallbackResponse.json().catch(() => null);

			if (fallbackResponse.ok) {
				return Response.json({
					reply:
						getGeminiReply(fallbackData) ??
						"I could not generate a reply. Please try again.",
					sources: [],
				});
			}
		}

		return Response.json(
			{ error: getErrorMessage(data) },
			{ status: response.status },
		);
	}

	const reply = getGeminiReply(data);
	const sources = getGeminiSources(data);

	return Response.json({
		reply: reply ?? "I could not generate a reply. Please try again.",
		sources,
	});
}
