import { createClient } from "@/lib/supabase/server";

import { saveResult } from "../quiz/actions";
import { Quiz } from "../quiz/quiz";
import { type CardWithResult, pickReviewCards } from "./review-cards";

export default async function ReviewPage() {
  const supabase = await createClient();
  // 新しく登録した順（/quiz と同じ）。最後の答えが不正解のカードだけを残す
  const { data, error } = await supabase
    .from("cards")
    .select("id, front, back, card_results!inner(correct)")
    .eq("card_results.correct", false)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });
  if (error) {
    // 詳しい内容はサーバーのログにだけ残し、利用者には固定の文言を出す
    console.error("復習するカードの読み込みに失敗しました", error);
    throw new Error("カードを読み込めませんでした");
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">復習</h1>
      <Quiz
        cards={pickReviewCards((data ?? []) as unknown as CardWithResult[])}
        emptyMessage="復習するカードはありません"
        restartHref="/review"
        saveResult={saveResult}
      />
    </main>
  );
}
