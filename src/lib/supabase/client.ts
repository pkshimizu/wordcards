import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseEnv } from "./env";

/** ブラウザー（Client Component）で使う Supabase クライアント */
export function createClient() {
  const { url, publishableKey } = requireSupabaseEnv();
  return createBrowserClient(url, publishableKey);
}
