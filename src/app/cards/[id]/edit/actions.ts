"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { validateCard } from "@/lib/cards/validate";
import { createClient } from "@/lib/supabase/server";

import type { CreateCardState } from "../../new/actions";

export type UpdateCardState = CreateCardState;

function asText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

/**
 * カードの表・裏を書き換えて /cards に移動する。入力に誤りがあれば保存せずにエラーを返す。
 * ログインは対象外（全員が同じカードを使う）なので、認可の確認はしない。
 */
export async function updateCard(
  id: number,
  _prev: UpdateCardState,
  formData: FormData,
): Promise<UpdateCardState> {
  const values = {
    front: asText(formData.get("front")),
    back: asText(formData.get("back")),
  };
  if (!Number.isSafeInteger(id) || id <= 0) {
    return { errors: { form: "カードが見つかりません" }, values };
  }
  const result = validateCard(values);
  if (!result.ok) return { errors: result.errors, values };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cards")
    .update(result.card)
    .eq("id", id)
    .select("id");
  if (error) {
    console.error("カードの保存に失敗しました", error);
    return { errors: { form: "カードを保存できませんでした" }, values };
  }
  if (!data || data.length === 0) {
    return { errors: { form: "カードが見つかりません" }, values };
  }

  revalidatePath("/cards");
  redirect("/cards");
}
