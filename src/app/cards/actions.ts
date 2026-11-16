"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type DeleteCardState = { error?: string };

/**
 * カードを1枚削除して /cards を再描画する。
 * ログインは対象外（全員が同じカードを使う）なので、認可の確認はしない。
 */
export async function deleteCard(
  _prev: DeleteCardState,
  formData: FormData,
): Promise<DeleteCardState> {
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id) || id <= 0) {
    return { error: "カードを削除できませんでした" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("cards").delete().eq("id", id);
  if (error) {
    console.error("カードの削除に失敗しました", error);
    return { error: "カードを削除できませんでした" };
  }

  revalidatePath("/cards");
  return {};
}
