import { createClient } from "@/lib/supabase/server";

import { saveResult } from "./actions";
import { Quiz } from "./quiz";

export default async function QuizPage() {
  const supabase = await createClient();
  // 新しく登録した順（最後に追加したカードが1問目）
  const { data, error } = await supabase
    .from("cards")
    .select("id, front, back")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });
  if (error) {
    // 詳しい内容はサーバーのログにだけ残し、利用者には固定の文言を出す
    console.error("カードの読み込みに失敗しました", error);
    throw new Error("カードを読み込めませんでした");
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">出題</h1>
      <Quiz cards={data ?? []} saveResult={saveResult} />
    </main>
  );
}
