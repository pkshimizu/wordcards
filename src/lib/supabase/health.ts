import type { SupabaseEnv } from "./env";

export type SupabaseHealth =
  | { status: "ok" }
  | { status: "not_configured" }
  | { status: "error"; detail: string };

/**
 * Supabase に接続できるかを確かめる。
 * テーブルに依存しないよう、Auth サーバーのヘルスチェック（/auth/v1/health）を呼ぶ。
 */
export async function checkSupabaseHealth(
  env: SupabaseEnv | null,
  fetchImpl: typeof fetch = fetch,
): Promise<SupabaseHealth> {
  if (!env) return { status: "not_configured" };
  try {
    const res = await fetchImpl(new URL("/auth/v1/health", env.url), {
      headers: { apikey: env.publishableKey },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { status: "error", detail: `HTTP ${res.status}` };
    return { status: "ok" };
  } catch (e) {
    return {
      status: "error",
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}
