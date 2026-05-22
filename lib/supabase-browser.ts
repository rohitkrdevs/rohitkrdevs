"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

declare global {
	var __rohitkrdevsSupabaseBrowserClient: SupabaseClient | undefined;
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
	if (globalThis.__rohitkrdevsSupabaseBrowserClient) {
		return globalThis.__rohitkrdevsSupabaseBrowserClient;
	}

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

	if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder")) {
		console.error(
			"Supabase setup error: missing or invalid public environment variables.",
		);
		return null;
	}

	globalThis.__rohitkrdevsSupabaseBrowserClient = createClient(
		supabaseUrl,
		supabaseAnonKey,
		{
			auth: {
				autoRefreshToken: false,
				detectSessionInUrl: false,
				persistSession: false,
			},
		},
	);

	return globalThis.__rohitkrdevsSupabaseBrowserClient;
}
