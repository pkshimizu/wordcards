/** Supabase に接続するための設定（どちらもブラウザーに公開してよい値） */
export type SupabaseEnv = {
  url: string;
  publishableKey: string;
};

/**
 * 環境変数から Supabase の設定を読む。未設定なら null を返す。
 *
 * `NEXT_PUBLIC_` で始まる変数はビルド時に埋め込まれるため、
 * `process.env.NEXT_PUBLIC_...` と直接書く必要がある（動的なキーでは読めない）。
 */
export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return null;
  return { url, publishableKey };
}

/** 設定が必須の場面で使う。未設定ならわかりやすいエラーにする */
export function requireSupabaseEnv(): SupabaseEnv {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY を設定してください（.env.example を参照）",
    );
  }
  return env;
}
