import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabaseEnv } from "./env";

/**
 * サーバー（Server Component・Route Handler・Server Action）で使う Supabase クライアント。
 * リクエストごとに作る（クッキーがリクエストごとに違うため）。
 */
export async function createClient() {
  // 先に cookies() を呼ぶ。これでビルド時の事前レンダリングはここで止まり、
  // 環境変数の確認はリクエスト時だけ行われる（ビルド環境に Supabase の設定が無くてもよい）。
  const cookieStore = await cookies();
  const { url, publishableKey } = requireSupabaseEnv();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component からは Cookie を書けない。
          // セッションの更新は、ログイン機能を作るときに Proxy（proxy.ts）で行う。
        }
      },
    },
  });
}
