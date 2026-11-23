import { createClient } from "@/lib/supabase/server";

import { Flashcards } from "./flashcards";
import { shuffle } from "./order";

export default async function FlashcardsPage() {
  const supabase = await createClient();
  // すべてのカードが対象。答えの結果（card_results）は読まない
  const { data, error } = await supabase
    .from("cards")
    .select("id, front, back");
  if (error) {
    // 詳しい内容はサーバーのログにだけ残し、利用者には固定の文言を出す
    console.error("カードの読み込みに失敗しました", error);
    throw new Error("カードを読み込めませんでした");
  }

  // 最初の一巡の順番は、ページを開くたびにサーバー側で決めて画面へ渡す
  const firstRound = shuffle(data ?? [], Math.random);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">カードモード</h1>
      <Flashcards cards={firstRound} />
    </main>
  );
}
