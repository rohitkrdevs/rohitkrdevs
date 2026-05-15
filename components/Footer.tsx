export default function Footer() {
	return (
		<footer className="border-t border-slate-200 bg-white/60 backdrop-blur-md dark:border-white/10 dark:bg-transparent">
			<div className="mx-auto max-w-6xl px-4 py-5 text-center">
				<p className="text-sm text-slate-600 dark:text-slate-400">
					© {new Date().getFullYear()} Rohit Kumar (@rohitkrdevs)
				</p>

				<p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
					Built with Next.js • React • Tailwind CSS
				</p>
			</div>
		</footer>
	);
}
