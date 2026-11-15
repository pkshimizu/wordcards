import { getSupabaseEnv } from "@/lib/supabase/env";
import { checkSupabaseHealth } from "@/lib/supabase/health";

/** 稼働確認用。アプリと Supabase の接続状態を返す（キーなどの値は返さない） */
export async function GET() {
  const supabase = await checkSupabaseHealth(getSupabaseEnv());
  const ok = supabase.status === "ok";
  return Response.json(
    { status: ok ? "ok" : "degraded", supabase },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
