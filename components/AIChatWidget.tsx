"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";

type ChatMessage = {
	role: "assistant" | "user";
	content: string;
	sources?: ChatSource[];
};

type ChatSource = {
	title: string;
	uri: string;
};

const starterMessages: ChatMessage[] = [
	{
		role: "assistant",
		content:
			"Hi, I am Rohit's Gemini assistant. Ask me about his profile, projects, code, careers, or anything on the internet.",
	},
];

const suggestedQuestions = [
	"Tell me about Rohit",
	"What is new in Next.js?",
	"Compare React and Vue",
];

function renderInlineMarkdown(text: string) {
	const parts = text.split(/(\*\*[^*]+\*\*)/g);

	return parts.map((part, index) => {
		if (part.startsWith("**") && part.endsWith("**")) {
			return (
				<strong key={`${part}-${index}`} className="font-bold text-current">
					{part.slice(2, -2)}
				</strong>
			);
		}

		return <span key={`${part}-${index}`}>{part}</span>;
	});
}

function renderMessageContent(content: string) {
	const normalizedContent = content.replace(
		/\s+([*-]\s+\*\*[^*]+:\*\*)/g,
		"\n$1",
	);
	const lines = normalizedContent
		.split(/\n+/)
		.map((line) => line.trim())
		.filter(Boolean);

	const blocks: React.ReactNode[] = [];
	let listItems: string[] = [];

	const flushList = () => {
		if (listItems.length === 0) return;

		blocks.push(
			<ul
				key={`list-${blocks.length}`}
				className="my-2 list-disc space-y-1 pl-5">
				{listItems.map((item, index) => (
					<li key={`${item}-${index}`} className="pl-1">
						{renderInlineMarkdown(item)}
					</li>
				))}
			</ul>,
		);

		listItems = [];
	};

	lines.forEach((line) => {
		const listMatch = line.match(/^[-*]\s+(.+)$/);

		if (listMatch) {
			listItems.push(listMatch[1]);
			return;
		}

		flushList();

		blocks.push(
			<p
				key={`paragraph-${blocks.length}`}
				className="my-1 first:mt-0 last:mb-0">
				{renderInlineMarkdown(line)}
			</p>,
		);
	});

	flushList();

	return blocks;
}

export default function AIChatWidget() {
	const [open, setOpen] = useState(false);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
	const scrollRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!open) return;

		scrollRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, open]);

	const askGemini = async (question: string) => {
		const trimmedQuestion = question.trim();

		if (!trimmedQuestion || loading) return;

		const nextMessages: ChatMessage[] = [
			...messages,
			{ role: "user", content: trimmedQuestion },
		];

		setMessages(nextMessages);
		setInput("");
		setError("");
		setLoading(true);

		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ messages: nextMessages }),
			});

			const data: unknown = await response.json().catch(() => null);
			const payload = data as {
				reply?: unknown;
				error?: unknown;
				sources?: unknown;
			} | null;

			if (!response.ok) {
				throw new Error(
					typeof payload?.error === "string"
						? payload.error
						: "Gemini is unavailable right now.",
				);
			}

			const sources = Array.isArray(payload?.sources)
				? payload.sources.filter(
						(source): source is ChatSource =>
							!!source &&
							typeof source === "object" &&
							typeof (source as ChatSource).title === "string" &&
							typeof (source as ChatSource).uri === "string",
					)
				: [];

			setMessages((current) => [
				...current,
				{
					role: "assistant",
					content:
						typeof payload?.reply === "string"
							? payload.reply
							: "I could not generate a reply. Please try again.",
					sources,
				},
			]);
		} catch (caughtError) {
			setError(
				caughtError instanceof Error
					? caughtError.message
					: "Gemini is unavailable right now.",
			);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void askGemini(input);
	};

	return (
		<div className="fixed bottom-6 left-4 z-50 sm:left-6">
			{open && (
				<section
					className="
						mb-4
						flex
						h-[min(620px,calc(100vh-8rem))]
						w-[calc(100vw-2rem)]
						max-w-97.5
						flex-col
						overflow-hidden
						rounded-2xl
						border
						border-(--surface-border)
						bg-(--surface)
						text-(--fg)
						shadow-2xl
						backdrop-blur-xl
					"
					aria-label="Gemini AI assistant">
					<header
						className="
							flex
							items-center
							justify-between
							gap-3
							border-b
							border-(--surface-border)
							px-4
							py-3
						">
						<div className="flex min-w-0 items-center gap-3">
							<div
								className="
									flex
									h-10
									w-10
									shrink-0
									items-center
									justify-center
									rounded-xl
									bg-(--accent)
									text-white
								">
								<Sparkles size={18} />
							</div>

							<div className="min-w-0">
								<h2 className="truncate text-base font-bold tracking-normal text-(--fg)">
									Ask Gemini AI
								</h2>
								<p className="truncate text-xs leading-5 text-(--muted)">
									Profile + web answers
								</p>
							</div>
						</div>

						<button
							type="button"
							onClick={() => setOpen(false)}
							className="
								flex
								h-9
								w-9
								shrink-0
								items-center
								justify-center
								rounded-xl
								text-(--muted)
								transition
								hover:bg-(--secondary)
								hover:text-(--secondary-fg)
							"
							aria-label="Close Gemini AI assistant">
							<X size={18} />
						</button>
					</header>

					<div className="flex-1 overflow-y-auto px-4 py-4">
						<div className="space-y-3">
							{messages.map((message, index) => {
								const isUser = message.role === "user";

								return (
									<div
										key={`${message.role}-${index}`}
										className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
										<div className="max-w-[84%]">
											<div
												className={`
													rounded-2xl
													px-4
													py-3
													text-sm
													leading-6
													${
														isUser
															? "bg-(--accent)-white"
															: "border border-(--surface-border) bg-(--secondary)-[var(--secondary-fg)]"
													}
												`}>
												{isUser
													? message.content
													: renderMessageContent(message.content)}
											</div>

											{!isUser &&
												message.sources &&
												message.sources.length > 0 && (
													<div className="mt-2 flex flex-wrap gap-2">
														{message.sources.map((source) => (
															<a
																key={source.uri}
																href={source.uri}
																target="_blank"
																rel="noopener noreferrer"
																className="
																max-w-full
																truncate
																rounded-full
																border
																border-(--surface-border)
																bg-(--surface)
																px-3
																py-1.5
																text-xs
																font-semibold
																text-(--muted)
																transition
																hover:border-(--accent)
																hover:text-(--accent)
															">
																{source.title}
															</a>
														))}
													</div>
												)}
										</div>
									</div>
								);
							})}

							{loading && (
								<div className="flex justify-start">
									<div className="flex items-center gap-2 rounded-2xl border border-(--surface-border) bg-(--secondary) py-3 text-sm text-(--muted)">
										<Loader2 className="h-4 w-4 animate-spin" />
										Thinking...
									</div>
								</div>
							)}

							<div ref={scrollRef} />
						</div>
					</div>

					{messages.length === 1 && (
						<div className="border-t border-(--surface-border) px-4 py-3">
							<div className="flex flex-wrap gap-2">
								{suggestedQuestions.map((question) => (
									<button
										key={question}
										type="button"
										onClick={() => void askGemini(question)}
										className="
											rounded-full
											border
											border-(--surface-border)
											px-3
											py-2
											text-left
											text-xs
											font-semibold
											text-(--muted)
											transition
											hover:border-(--accent)
											hover:text-(--accent)
										">
										{question}
									</button>
								))}
							</div>
						</div>
					)}

					{error && (
						<p className="border-t border-red-500/20 bg-red-500/5 px-4 py-2 text-xs leading-5 text-red-500">
							{error}
						</p>
					)}

					<form
						onSubmit={handleSubmit}
						className="border-t border-(--surface-border) p-3">
						<div className="flex items-end gap-2">
							<textarea
								value={input}
								onChange={(event) => setInput(event.target.value)}
								rows={1}
								placeholder="Ask anything..."
								className="
									max-h-28
									min-h-11
									flex-1
									resize-none
									rounded-xl
									border
									border-(--surface-border)
									bg-(--secondary)
									px-3
									py-2.5
									text-sm
									leading-6
									text-(--secondary-fg)
									outline-none
									transition
									placeholder:text-slate-400
									focus:border-(--accent)
									focus:bg-(--surface)
									focus:ring-4
									focus:ring-blue-500/10
								"
							/>

							<button
								type="submit"
								disabled={loading || input.trim().length === 0}
								className="
									flex
									h-11
									w-11
									shrink-0
									items-center
									justify-center
									rounded-xl
									bg-(--accent)
									text-white
									shadow-lg
									shadow-blue-500/20
									transition
									hover:-translate-y-0.5
									hover:brightness-110
									disabled:cursor-not-allowed
									disabled:opacity-50
									disabled:hover:translate-y-0
								"
								aria-label="Send message">
								{loading ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Send size={17} />
								)}
							</button>
						</div>
					</form>
				</section>
			)}

			<button
				type="button"
				onClick={() => setOpen((current) => !current)}
				className="
					flex
					h-13
					w-13
					items-center
					justify-center
					rounded-2xl
					bg-(--accent)
					text-white
					shadow-xl
					shadow-blue-500/25
					transition
					hover:-translate-y-1
					hover:brightness-110
				"
				aria-label={
					open ? "Hide Gemini AI assistant" : "Open Gemini AI assistant"
				}>
				<MessageCircle size={22} />
			</button>
		</div>
	);
}
