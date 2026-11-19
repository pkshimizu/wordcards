"use server";

import { createClient } from "@/lib/supabase/server";

export type SaveResultState = { error?: string };

/**
 * 答え合わせの結果をカードごとに保存する（前の結果は上書きする）。
 * /quiz と /review の両方から呼ぶ。
 * ここでは再描画（revalidatePath）をしない。出題の途中で問題の並びが変わらないようにするため。
 * ログインは対象外（全員が同じカードを使う）なので、認可の確認はしない。
 */
export async function saveResult(
  cardId: number,
  correct: boolean,
): Promise<SaveResultState> {
  if (
    !Number.isSafeInteger(cardId) ||
    cardId <= 0 ||
    typeof correct !== "boolean"
  ) {
    return { error: "答えの結果を保存できませんでした" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("card_results").upsert(
    {
      card_id: cardId,
      correct,
      answered_at: new Date().toISOString(),
    },
    { onConflict: "card_id" },
  );
  if (error) {
    console.error("答えの結果の保存に失敗しました", error);
    return { error: "答えの結果を保存できませんでした" };
  }
  return {};
}
