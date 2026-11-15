"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { CardErrors } from "@/lib/cards/validate";
import { validateCard } from "@/lib/cards/validate";
import { createClient } from "@/lib/supabase/server";

export type CreateCardState = {
  errors: CardErrors & { form?: string };
  values: { front: string; back: string };
};

function asText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

/**
 * カードを1枚保存して /cards に移動する。入力に誤りがあれば保存せずにエラーを返す。
 * ログインは対象外（全員が同じカードを使う）なので、認可の確認はしない。
 */
export async function createCard(
  _prev: CreateCardState,
  formData: FormData,
): Promise<CreateCardState> {
  const values = {
    front: asText(formData.get("front")),
    back: asText(formData.get("back")),
  };
  const result = validateCard(values);
  if (!result.ok) return { errors: result.errors, values };

  const supabase = await createClient();
  const { error } = await supabase.from("cards").insert(result.card);
  if (error) {
    console.error("カードの保存に失敗しました", error);
    return { errors: { form: "カードを保存できませんでした" }, values };
  }

  revalidatePath("/cards");
  redirect("/cards");
}
